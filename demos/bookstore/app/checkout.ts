import type { RouteHandlers } from '@remix-run/fetch-router'
import { redirect } from '@remix-run/fetch-router/response-helpers'

import { routes } from '../routes.ts'
import { requireAuth, SESSION_ID_KEY } from './middleware/auth.ts'
import { getCart, clearCart, getCartTotal } from './models/cart.ts'
import { createOrder, getOrderById } from './models/orders.ts'
import { Layout$ } from './layout.ts'
import { render } from './utils/render.ts'
import { getCurrentUser, getStorage } from './utils/context.ts'
import {
  a,
  button,
  div,
  form,
  h1,
  h1$,
  h2$,
  input,
  label,
  p,
  p$,
  span,
  strong$,
  table,
  tbody$,
  td,
  td$,
  tfoot$,
  th$,
  thead$,
  tr,
  tr$,
} from './renuel.ts'

export default {
  middleware: [requireAuth],
  handlers: {
    index() {
      let sessionId = getStorage().get(SESSION_ID_KEY)
      let cart = getCart(sessionId)
      let total = getCartTotal(cart)

      if (cart.items.length === 0) {
        return render(
          Layout$(
            div(
              { className: 'card' },
              h1$('Checkout'),
              p$('Your cart is empty. Add some books before checking out.'),
              p(
                { style: { marginTop: '1rem' } },
                a({ href: routes.books.index.href(), className: 'btn' }, 'Browse Books'),
              ),
            ),
          ),
        )
      }

      return render(
        Layout$(
          h1$('Checkout'),
          div(
            { className: 'card' },
            h2$('Order Summary'),
            table(
              { style: { marginTop: '1rem' } },
              thead$(tr$(th$('Book'), th$('Quantity'), th$('Price'), th$('Subtotal'))),
              tbody$(
                cart.items.map((item) =>
                  tr(
                    { key: item.title },
                    td$(item.title),
                    td$(item.quantity),
                    td$('$', item.price.toFixed(2)),
                    td$('$', (item.price * item.quantity).toFixed(2)),
                  ),
                ),
              ),
              tfoot$(
                tr$(
                  td({ colSpan: 3, style: { textAlign: 'right', fontWeight: 'bold' } }, 'Total:'),
                  td({ style: { fontWeight: 'bold' } }, '$', total.toFixed(2)),
                ),
              ),
            ),
          ),
          div(
            { className: 'card', style: { marginTop: '1.5rem' } },
            h2$('Shipping Information'),
            form(
              { method: 'POST', action: routes.checkout.action.href() },
              div(
                { className: 'form-group' },
                label({ htmlFor: 'street' }, 'Street Address'),
                input({ type: 'text', id: 'street', name: 'street', required: true }),
              ),
              div(
                { className: 'form-group' },
                label({ htmlFor: 'city' }, 'City'),
                input({ type: 'text', id: 'city', name: 'city', required: true }),
              ),
              div(
                { className: 'form-group' },
                label({ htmlFor: 'state' }, 'State'),
                input({ type: 'text', id: 'state', name: 'state', required: true }),
              ),
              div(
                { className: 'form-group' },
                label({ htmlFor: 'zip' }, 'ZIP Code'),
                input({ type: 'text', id: 'zip', name: 'zip', required: true }),
              ),
              button({ type: 'submit', className: 'btn' }, 'Place Order'),
              a(
                {
                  href: routes.cart.index.href(),
                  className: 'btn btn-secondary',
                  style: { marginLeft: '0.5rem' },
                },
                'Back to Cart',
              ),
            ),
          ),
        ),
      )
    },

    async action({ formData }) {
      let user = getCurrentUser()
      let sessionId = getStorage().get(SESSION_ID_KEY)
      let cart = getCart(sessionId)

      if (cart.items.length === 0) {
        return redirect(routes.cart.index.href())
      }

      let shippingAddress = {
        street: formData.get('street')?.toString() || '',
        city: formData.get('city')?.toString() || '',
        state: formData.get('state')?.toString() || '',
        zip: formData.get('zip')?.toString() || '',
      }

      let order = createOrder(
        user.id,
        cart.items.map((item) => ({
          bookId: item.bookId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress,
      )

      clearCart(sessionId)

      return redirect(routes.checkout.confirmation.href({ orderId: order.id }))
    },

    confirmation({ params }) {
      let user = getCurrentUser()
      let order = getOrderById(params.orderId)

      if (!order || order.userId !== user.id) {
        return render(
          Layout$(
            div(
              { className: 'card' },
              h1$('Order Not Found'),
              p$(
                a({ href: routes.account.orders.index.href(), className: 'btn' }, 'View My Orders'),
              ),
            ),
          ),
          { status: 404 },
        )
      }

      return render(
        Layout$(
          div(
            { className: 'alert alert-success' },
            h1({ style: { marginBottom: '0.5rem' } }, 'Order Confirmed!'),
            p$('Thank you for your purchase. Your order has been placed successfully.'),
          ),
          div(
            { className: 'card' },
            h2$('Order #', order.id),
            p$(strong$('Order Date: '), order.createdAt.toLocaleDateString()),
            p$(strong$('Total: '), `$${order.total.toFixed(2)}`),
            p$(strong$('Status: '), span({ className: 'badge badge-info' }, order.status)),
            p(
              { style: { marginTop: '2rem' } },
              "We'll send you a confirmation email shortly. You can track your order status in your account.",
            ),
            div(
              { style: { marginTop: '2rem' } },
              a(
                {
                  href: routes.account.orders.show.href({ orderId: order.id }),
                  className: 'btn',
                },
                'View Order Details',
              ),
              a(
                {
                  href: routes.books.index.href(),
                  className: 'btn btn-secondary',
                  style: { marginLeft: '0.5rem' },
                },
                'Continue Shopping',
              ),
            ),
          ),
        ),
      )
    },
  },
} satisfies RouteHandlers<typeof routes.checkout>
