import type { RouteHandlers } from '@remix-run/fetch-router'
import { redirect } from '@remix-run/fetch-router/response-helpers'

import { routes } from '../routes.ts'
import { Layout$ } from './layout.ts'
import { requireAuth } from './middleware/auth.ts'
import { getOrdersByUserId, getOrderById } from './models/orders.ts'
import { updateUser } from './models/users.ts'
import { getCurrentUser } from './utils/context.ts'
import { render } from './utils/render.ts'
import { RestfulForm, RestfulForm$ } from './components/restful-form.ts'
import {
  a,
  button,
  div,
  h1$,
  h2,
  h2$,
  input,
  label,
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
  tr$,
} from './renuel.ts'

export default {
  middleware: [requireAuth],
  handlers: {
    index() {
      let user = getCurrentUser()

      return render(
        Layout$(
          h1$('My Account'),
          div(
            { class: 'card' },
            h2$('Account Information'),
            p$(strong$('Name:'), ` ${user.name}`),
            p$(strong$('Email:'), ` ${user.email}`),
            p$(strong$('Role:'), ` ${user.role}`),
            p$(strong$('Member Since:'), ` ${user.createdAt.toLocaleDateString()}`),
            p(
              { style: { marginTop: '1.5rem' } },
              a({ href: routes.account.settings.index.href(), class: 'btn' }, 'Edit Settings'),
            ),
          ),
          div(
            { class: 'card', style: { marginTop: '1.5rem' } },
            h2$('Quick Links'),
            p$(
              a(
                { href: routes.account.orders.index.href(), class: 'btn btn-secondary' },
                'View Orders',
              ),
              a(
                {
                  href: routes.books.index.href(),
                  class: 'btn btn-secondary',
                  style: { marginLeft: '0.5rem' },
                },
                'Browse Books',
              ),
            ),
          ),
        ),
      )
    },

    settings: {
      index() {
        let user = getCurrentUser()

        return render(
          Layout$(
            h1$('Account Settings'),
            div(
              { class: 'card' },
              RestfulForm(
                { method: 'PUT', action: routes.account.settings.update.href() },
                div(
                  { class: 'form-group' },
                  label({ for: 'name' }, 'Name'),
                  input({
                    type: 'text',
                    id: 'name',
                    name: 'name',
                    value: user.name,
                    required: true,
                  }),
                ),

                div(
                  { class: 'form-group' },
                  label({ for: 'email' }, 'Email'),
                  input({
                    type: 'email',
                    id: 'email',
                    name: 'email',
                    value: user.email,
                    required: true,
                  }),
                ),

                div(
                  { class: 'form-group' },
                  label({ for: 'password' }, 'New Password (leave blank to keep current)'),
                  input({
                    type: 'password',
                    id: 'password',
                    name: 'password',
                    autoComplete: 'new-password',
                  }),
                ),
                button({ type: 'submit', class: 'btn' }, 'Update Settings'),
                a(
                  {
                    href: routes.account.index.href(),
                    class: 'btn btn-secondary',
                    style: { marginLeft: '0.5rem' },
                  },
                  'Cancel',
                ),
              ),
            ),
          ),
        )
      },

      async update({ formData }) {
        let user = getCurrentUser()

        let name = formData.get('name')?.toString() ?? ''
        let email = formData.get('email')?.toString() ?? ''
        let password = formData.get('password')?.toString() ?? ''

        let updateData: any = { name, email }
        if (password) {
          updateData.password = password
        }

        updateUser(user.id, updateData)

        return redirect(routes.account.index.href())
      },
    },

    orders: {
      index() {
        let user = getCurrentUser()
        let orders = getOrdersByUserId(user.id)

        return render(
          Layout$(
            h1$('My Orders'),

            div(
              { class: 'card' },
              orders.length > 0
                ? table$(
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
                        tr$(
                          td$(`#${order.id}`),
                          td$(order.createdAt.toLocaleDateString()),
                          td$(`${order.items.length} item(s)`),
                          td$(`$${order.total.toFixed(2)}`),
                          td$(span({ class: 'badge badge-info' }, order.status)),
                          td$(
                            a(
                              {
                                href: routes.account.orders.show.href({ orderId: order.id }),
                                class: 'btn btn-secondary',
                                style: { fontSize: '0.875rem', padding: '0.25rem 0.5rem' },
                              },
                              'View',
                            ),
                          ),
                        ),
                      ),
                    ),
                  )
                : p$('You have no orders yet.'),
            ),

            p(
              { style: { marginTop: '1.5rem' } },
              a(
                { href: routes.account.index.href(), class: 'btn btn-secondary' },
                'Back to Account',
              ),
            ),
          ),
        )
      },

      show({ params }) {
        let user = getCurrentUser()
        let order = getOrderById(params.orderId)

        if (!order || order.userId !== user.id) {
          return render(
            Layout$(
              div(
                { class: 'card' },
                h1$('Order Not Found'),
                p$(a({ href: routes.account.orders.index.href(), class: 'btn' }, 'Back to Orders')),
              ),
            ),
            { status: 404 },
          )
        }

        return render(
          Layout$(
            h1$(`Order #${order.id}`),
            div(
              { class: 'card' },
              p$(strong$('Order Date:'), ` ${order.createdAt.toLocaleDateString()}`),
              p$(strong$('Status:'), span({ class: 'badge badge-info' }, order.status)),
              h2({ style: { marginTop: '2rem' } }, 'Items'),
              table(
                { style: { marginTop: '1rem' } },
                thead$(tr$(th$('Book'), th$('Quantity'), th$('Price'), th$('Subtotal'))),
                tbody$(
                  order.items.map((item) =>
                    tr$(
                      td$(item.title),
                      td$(item.quantity.toString()),
                      td$(`$${item.price.toFixed(2)}`),
                      td$(`$${(item.price * item.quantity).toFixed(2)}`),
                    ),
                  ),
                ),
                tfoot$(
                  tr$(
                    td({ colSpan: 3, style: { textAlign: 'right', fontWeight: 'bold' } }, 'Total:'),
                    td({ style: { fontWeight: 'bold' } }, order.total.toFixed(2)),
                  ),
                ),
              ),
              h2({ style: { marginTop: '2rem' } }, 'Shipping Address'),
              p$(order.shippingAddress.street),
              p$(
                `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`,
              ),
            ),
            p(
              { style: { marginTop: '1.5rem' } },
              a(
                { href: routes.account.orders.index.href(), class: 'btn btn-secondary' },
                'Back to Orders',
              ),
            ),
          ),
        )
      },
    },
  },
} satisfies RouteHandlers<typeof routes.account>
