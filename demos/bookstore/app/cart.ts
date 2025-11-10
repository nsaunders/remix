import type { RouteHandlers } from '@remix-run/fetch-router'
import { redirect } from '@remix-run/fetch-router/response-helpers'

import { routes } from '../routes.ts'

import { Layout$ } from './layout.ts'
import { loadAuth, SESSION_ID_KEY } from './middleware/auth.ts'
import { getBookById } from './models/books.ts'
import { getCart, addToCart, updateCartItem, removeFromCart, getCartTotal } from './models/cart.ts'
import type { User } from './models/users.ts'
import { getCurrentUser, getStorage } from './utils/context.ts'
import { render } from './utils/render.ts'
import { setSessionCookie } from './utils/session.ts'
import { RestfulForm } from './components/restful-form.ts'
import {
  a,
  a$,
  button,
  div,
  h1$,
  input,
  p,
  p$,
  table$,
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
  middleware: [loadAuth],
  handlers: {
    index() {
      let sessionId = getStorage().get(SESSION_ID_KEY)
      let cart = getCart(sessionId)
      let total = getCartTotal(cart)

      let user: User | null = null
      try {
        user = getCurrentUser()
      } catch {
        // user not authenticated
      }

      return render(
        Layout$(
          h1$('Shopping Cart'),
          div(
            { className: 'card' },
            cart.items.length > 0
              ? [
                  // If true (Cart has items)
                  table$(
                    thead$(
                      tr$(
                        th$('Book'),
                        th$('Price'),
                        th$('Quantity'),
                        th$('Subtotal'),
                        th$('Actions'),
                      ),
                    ),
                    tbody$(
                      cart.items.map((item) =>
                        tr(
                          { key: item.bookId },
                          td$(a({ href: routes.books.show.href({ slug: item.slug }) }, item.title)),
                          td$('$', item.price.toFixed(2)),
                          td$(
                            RestfulForm(
                              {
                                method: 'PUT',
                                action: routes.cart.api.update.href(),
                                style: {
                                  display: 'inline-flex',
                                  gap: '0.5rem',
                                  alignItems: 'center',
                                },
                              },
                              input({ type: 'hidden', name: 'bookId', value: item.bookId }),
                              input({
                                type: 'number',
                                name: 'quantity',
                                value: item.quantity,
                                min: '1',
                                style: { width: '70px' },
                              }),
                              button(
                                {
                                  type: 'submit',
                                  className: 'btn btn-secondary',
                                  style: { fontSize: '0.875rem', padding: '0.25rem 0.5rem' },
                                },
                                'Update',
                              ),
                            ),
                          ),
                          td$('$', (item.price * item.quantity).toFixed(2)),
                          td$(
                            RestfulForm(
                              {
                                method: 'DELETE',
                                action: routes.cart.api.remove.href(),
                                style: { display: 'inline' },
                              },
                              input({ type: 'hidden', name: 'bookId', value: item.bookId }),
                              button(
                                {
                                  type: 'submit',
                                  className: 'btn btn-danger',
                                  style: { fontSize: '0.875rem', padding: '0.25rem 0.5rem' },
                                },
                                'Remove',
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    tfoot$(
                      tr$(
                        td(
                          { colSpan: 3, style: { textAlign: 'right', fontWeight: 'bold' } },
                          'Total:',
                        ),
                        td({ style: { fontWeight: 'bold' } }, '$', total.toFixed(2)),
                        td$(),
                      ),
                    ),
                  ),
                  div(
                    { style: { marginTop: '2rem', display: 'flex', gap: '1rem' } },
                    a(
                      { href: routes.books.index.href(), className: 'btn btn-secondary' },
                      'Continue Shopping',
                    ),
                    user
                      ? a(
                          { href: routes.checkout.index.href(), className: 'btn' },
                          'Proceed to Checkout',
                        )
                      : a(
                          { href: routes.auth.login.index.href(), className: 'btn' },
                          'Login to Checkout',
                        ),
                  ),
                ]
              : [
                  p$('Your cart is empty.'),
                  p(
                    { style: { marginTop: '1rem' } },
                    a({ href: routes.books.index.href(), className: 'btn' }, 'Browse Books'),
                  ),
                ],
          ),
        ),
      )
    },

    api: {
      async add({ storage, formData }) {
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 1000))

        let sessionId = storage.get(SESSION_ID_KEY)
        let bookId = formData.get('bookId')?.toString() ?? ''

        let book = getBookById(bookId)
        if (!book) {
          return new Response('Book not found', { status: 404 })
        }

        addToCart(sessionId, book.id, book.slug, book.title, book.price, 1)

        let headers = new Headers()
        setSessionCookie(headers, sessionId)

        if (formData.get('redirect') === 'none') {
          return new Response(null, { status: 204 })
        }

        return redirect(routes.cart.index.href(), { headers })
      },

      async update({ storage, formData }) {
        let sessionId = storage.get(SESSION_ID_KEY)
        let bookId = formData.get('bookId')?.toString() ?? ''
        let quantity = parseInt(formData.get('quantity')?.toString() ?? '1', 10)

        updateCartItem(sessionId, bookId, quantity)

        let headers = new Headers()
        setSessionCookie(headers, sessionId)

        if (formData.get('redirect') === 'none') {
          return new Response(null, { status: 204 })
        }

        return redirect(routes.cart.index.href(), { headers })
      },

      async remove({ storage, formData }) {
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 1000))

        let sessionId = storage.get(SESSION_ID_KEY)
        let bookId = formData.get('bookId')?.toString() ?? ''

        removeFromCart(sessionId, bookId)

        let headers = new Headers()
        setSessionCookie(headers, sessionId)

        if (formData.get('redirect') === 'none') {
          return new Response(null, { status: 204 })
        }

        return redirect(routes.cart.index.href(), { headers })
      },
    },
  },
} satisfies RouteHandlers<typeof routes.cart>
