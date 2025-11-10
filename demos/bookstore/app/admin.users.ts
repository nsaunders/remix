import type { RouteHandlers } from '@remix-run/fetch-router'
import { redirect } from '@remix-run/fetch-router/response-helpers'

import { routes } from '../routes.ts'
import { getAllUsers, getUserById, updateUser, deleteUser } from './models/users.ts'
import { Layout$ } from './layout.ts'
import { render } from './utils/render.ts'
import { getCurrentUser } from './utils/context.ts'
import { RestfulForm } from './components/restful-form.ts'
import {
  a,
  button,
  div,
  h1$,
  input,
  label,
  option,
  p,
  p$,
  select,
  span,
  strong$,
  table$,
  tbody$,
  td,
  td$,
  th$,
  thead$,
  tr,
  tr$,
} from './renuel.ts'

export default {
  index() {
    let user = getCurrentUser()
    let users = getAllUsers()

    return render(
      Layout$(
        h1$('Manage Users'),

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
            thead$(tr$(th$('Name'), th$('Email'), th$('Role'), th$('Created'), th$('Actions'))),
            tbody$(
              users.map((u) =>
                tr(
                  { key: u.id },
                  td$(u.name),
                  td$(u.email),
                  td$(
                    span(
                      {
                        className: `badge ${u.role === 'admin' ? 'badge-info' : 'badge-success'}`,
                      },
                      u.role,
                    ),
                  ),
                  td$(u.createdAt.toLocaleDateString()),
                  td(
                    { className: 'actions' },
                    a(
                      {
                        href: routes.admin.users.edit.href({ userId: u.id }),
                        className: 'btn btn-secondary',
                        style: { fontSize: '0.875rem', padding: '0.25rem 0.5rem' },
                      },
                      'Edit',
                    ),
                    u.id !== user.id
                      ? RestfulForm(
                          {
                            method: 'DELETE',
                            action: routes.admin.users.destroy.href({ userId: u.id }),
                            style: { display: 'inline', marginLeft: '0.5rem' }, // Added margin for spacing
                          },
                          button(
                            {
                              type: 'submit',
                              className: 'btn btn-danger',
                              style: { fontSize: '0.875rem', padding: '0.25rem 0.5rem' },
                            },
                            'Delete',
                          ),
                        )
                      : null,
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
    let targetUser = getUserById(params.userId)

    if (!targetUser) {
      return render(Layout$(div({ class: 'card' }, h1$('User Not Found'))), { status: 404 })
    }

    return render(
      Layout$(
        h1$('User Details'),
        div(
          { className: 'card' },
          p$(strong$('Name: '), targetUser.name),
          p$(strong$('Email: '), targetUser.email),
          p$(
            strong$('Role: '),
            span(
              {
                className: `badge ${targetUser.role === 'admin' ? 'badge-info' : 'badge-success'}`,
              },
              targetUser.role,
            ),
          ),
          p$(strong$('Created: '), targetUser.createdAt.toLocaleDateString()),
          div(
            { style: { marginTop: '2rem' } },
            a(
              {
                href: routes.admin.users.edit.href({ userId: targetUser.id }),
                className: 'btn',
              },
              'Edit',
            ),
            a(
              {
                href: routes.admin.users.index.href(),
                className: 'btn btn-secondary',
                style: { marginLeft: '0.5rem' },
              },
              'Back to List',
            ),
          ),
        ),
      ),
    )
  },

  edit({ params }) {
    let targetUser = getUserById(params.userId)

    if (!targetUser) {
      return render(Layout$(div({ class: 'card' }, h1$('User Not Found'))), { status: 404 })
    }

    return render(
      Layout$(
        h1$('Edit User'),
        div(
          { className: 'card' },
          RestfulForm(
            {
              method: 'PUT',
              action: routes.admin.users.update.href({ userId: targetUser.id }),
            },
            div(
              { className: 'form-group' },
              label({ htmlFor: 'name' }, 'Name'),
              input({
                type: 'text',
                id: 'name',
                name: 'name',
                value: targetUser.name,
                required: true,
              }),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'email' }, 'Email'),
              input({
                type: 'email',
                id: 'email',
                name: 'email',
                value: targetUser.email,
                required: true,
              }),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'role' }, 'Role'),
              select(
                { id: 'role', name: 'role' },
                option({ value: 'customer', selected: targetUser.role === 'customer' }, 'Customer'),
                option({ value: 'admin', selected: targetUser.role === 'admin' }, 'Admin'),
              ),
            ),
            button({ type: 'submit', className: 'btn' }, 'Update User'),
            a(
              {
                href: routes.admin.users.index.href(),
                className: 'btn btn-secondary',
                style: { marginLeft: '0.5rem' },
              },
              'Cancel',
            ),
          ),
        ),
      ),
    )
  },

  async update({ formData, params }) {
    updateUser(params.userId, {
      name: formData.get('name')?.toString() ?? '',
      email: formData.get('email')?.toString() ?? '',
      role: (formData.get('role')?.toString() ?? 'customer') as 'customer' | 'admin',
    })

    return redirect(routes.admin.users.index.href())
  },

  destroy({ params }) {
    deleteUser(params.userId)

    return redirect(routes.admin.users.index.href())
  },
} satisfies RouteHandlers<typeof routes.admin.users>
