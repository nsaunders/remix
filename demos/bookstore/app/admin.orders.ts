import type { RouteHandlers } from '@remix-run/fetch-router'

import { routes } from '../routes.ts'
import { getAllOrders, getOrderById } from './models/orders.ts'
import { Layout$ } from './layout.ts'
import { render } from './utils/render.ts'
import {
  a,
  div,
  h1$,
  h2,
  p,
  p$,
  span,
  strong$,
  table,
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
  index() {
    let orders = getAllOrders()

    return render(
      Layout$(
        h1$('Manage Orders'),

        p(
          { style: { marginBottom: '1rem' } },
          a(
            { href: routes.admin.index.href(), className: 'btn btn-secondary' },
            'Back to Dashboard',
          ),
        ),

        div(
          { className: 'card' },
          table$(
            thead$(
              tr$(
                th$('Order ID'),
                th$('Date'),
                th$('Items'),
                th$('Total'),
                th$('Status'),
                th$('Actions'),
              ),
            ),
            tbody$(
              orders.map((order) =>
                tr(
                  { key: order.id },
                  td$('#', order.id),
                  td$(order.createdAt.toLocaleDateString()),
                  td$(order.items.length, ' item(s)'),
                  td$('$', order.total.toFixed(2)),
                  td$(span({ className: 'badge badge-info' }, order.status)),
                  td$(
                    a(
                      {
                        href: routes.admin.orders.show.href({ orderId: order.id }),
                        className: 'btn btn-secondary',
                        style: { fontSize: '0.875rem', padding: '0.25rem 0.5rem' },
                      },
                      'View',
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    )
  },

  show({ params }) {
    let order = getOrderById(params.orderId)

    if (!order) {
      return render(Layout$(div({ class: 'card' }, h1$('Order Not Found'))), { status: 404 })
    }

    return render(
      Layout$(
        h1$('Order #', order.id),

        div(
          { className: 'card' },
          p$(strong$('Order Date: '), order.createdAt.toLocaleDateString()),
          p$(strong$('User ID: '), order.userId),
          p$(strong$('Status: '), span({ className: 'badge badge-info' }, order.status)),

          h2({ style: { marginTop: '2rem' } }, 'Items'),
          table(
            { style: { marginTop: '1rem' } },
            thead$(tr$(th$('Book'), th$('Quantity'), th$('Price'), th$('Subtotal'))),
            tbody$(
              order.items.map((item) =>
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
                td({ style: { fontWeight: 'bold' } }, '$', order.total.toFixed(2)),
              ),
            ),
          ),
          h2({ style: { marginTop: '2rem' } }, 'Shipping Address'),
          p$(order.shippingAddress.street),
          p$(
            order.shippingAddress.city,
            ', ',
            order.shippingAddress.state,
            ' ',
            order.shippingAddress.zip,
          ),
        ),

        p(
          { style: { marginTop: '1.5rem' } },
          a(
            { href: routes.admin.orders.index.href(), className: 'btn btn-secondary' },
            'Back to Orders',
          ),
        ),
      ),
    )
  },
} satisfies RouteHandlers<typeof routes.admin.orders>
