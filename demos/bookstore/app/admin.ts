import type { RouteHandlers } from '@remix-run/fetch-router'

import { routes } from '../routes.ts'
import adminBooksHandlers from './admin.books.ts'
import adminOrdersHandlers from './admin.orders.ts'
import adminUsersHandlers from './admin.users.ts'
import { Layout$ } from './layout.ts'
import { requireAuth } from './middleware/auth.ts'
import { requireAdmin } from './middleware/admin.ts'
import { render } from './utils/render.ts'
import { a, div, h1$, h2$, p$ } from './renuel.ts'

export default {
  middleware: [requireAuth, requireAdmin],
  handlers: {
    index() {
      return render(
        Layout$(
          h1$('Admin Dashboard'),
          div(
            {
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
              },
            },
            // Manage Books Card
            div(
              { className: 'card' },
              h2$('Manage Books'),
              p$('Add, edit, or remove books from the catalog.'),
              a(
                {
                  href: routes.admin.books.index.href(),
                  className: 'btn',
                  style: { marginTop: '1rem' },
                },
                'View Books',
              ),
            ),
            // Manage Users Card
            div(
              { className: 'card' },
              h2$('Manage Users'),
              p$('View and manage user accounts.'),
              a(
                {
                  href: routes.admin.users.index.href(),
                  className: 'btn',
                  style: { marginTop: '1rem' },
                },
                'View Users',
              ),
            ),
            div(
              { className: 'card' },
              h2$('View Orders'),
              p$('Monitor and manage customer orders.'),
              a(
                {
                  href: routes.admin.orders.index.href(),
                  className: 'btn',
                  style: { marginTop: '1rem' },
                },
                'View Orders',
              ),
            ),
          ),
        ),
      )
    },

    books: adminBooksHandlers,
    users: adminUsersHandlers,
    orders: adminOrdersHandlers,
  },
} satisfies RouteHandlers<typeof routes.admin>
