import type { RouteHandlers } from '@remix-run/fetch-router'
import { redirect } from '@remix-run/fetch-router/response-helpers'

import { routes } from '../routes.ts'
import { getSession, setSessionCookie, login, logout } from './utils/session.ts'
import {
  authenticateUser,
  createUser,
  getUserByEmail,
  createPasswordResetToken,
  resetPassword,
} from './models/users.ts'
import { Document$ } from './layout.ts'
import { loadAuth } from './middleware/auth.ts'
import { render } from './utils/render.ts'
import { a, button, div, form, h1, h1$, input, label, p, p$, strong$, style } from './renuel.ts'

export default {
  middleware: [loadAuth],
  handlers: {
    login: {
      index() {
        return render(
          Document$(
            div(
              { class: 'card', style: { maxWidth: '500px', margin: '2rem auto' } },
              h1$('Login'),
              form(
                { method: 'POST', action: routes.auth.login.action.href() },
                div(
                  { class: 'form-group' },
                  label({ for: 'email' }, 'Email'),
                  input({
                    type: 'email',
                    id: 'email',
                    name: 'email',
                    required: true,
                    autoComplete: 'email',
                  }),
                ),
                div(
                  { class: 'form-group' },
                  label({ for: 'password' }, 'Password'),
                  input({
                    type: 'password',
                    id: 'password',
                    name: 'password',
                    required: true,
                    autoComplete: 'current-password',
                  }),
                ),
                button({ type: 'submit', class: 'btn' }, 'Login'),
              ),
              p(
                { style: { marginTop: '1.5rem' } },
                "Don't have an account? ",
                a({ href: routes.auth.register.index.href() }, 'Register here'),
              ),
              p$(a({ href: routes.auth.forgotPassword.index.href() }, 'Forgot password?')),
              div(
                {
                  style: {
                    marginTop: '2rem',
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '4px',
                  },
                },
                p({ style: { fontSize: '0.9rem' } }, strong$('Demo accounts:')),
                p({ style: { fontSize: '0.9rem' } }, 'Admin: admin@bookstore.com / admin123'),
                p(
                  { style: { fontSize: '0.9rem' } },
                  'Customer: customer@example.com / password123',
                ),
              ),
            ),
          ),
        )
      },

      async action({ request, formData }) {
        let email = formData.get('email')?.toString() ?? ''
        let password = formData.get('password')?.toString() ?? ''
        let user = authenticateUser(email, password)

        if (!user) {
          return render(
            Document$(
              div(
                { class: 'card', style: { maxWidth: '500px', margin: '2rem auto' } },
                div({ class: 'alert alert-error' }, 'Invalid email or password. Please try again.'),
                p$(a({ href: routes.auth.login.index.href(), class: 'btn' }, 'Back to Login')),
              ),
            ),
            { status: 401 },
          )
        }

        let session = getSession(request)
        login(session.sessionId, user)

        let headers = new Headers()
        setSessionCookie(headers, session.sessionId)

        return redirect(routes.account.index.href(), { headers })
      },
    },

    register: {
      index() {
        return render(
          Document$(
            div(
              { class: 'card', style: { maxWidth: '500px', margin: '2rem auto' } },
              h1$('Register'),
              form(
                { method: 'POST', action: routes.auth.register.action.href() },
                div(
                  { class: 'form-group' },
                  label({ for: 'name' }, 'Name'),
                  input({
                    type: 'text',
                    id: 'name',
                    name: 'name',
                    required: true,
                    autoComplete: 'name',
                  }),
                ),
                div(
                  { class: 'form-group' },
                  label({ for: 'email' }, 'Email'),
                  input({
                    type: 'email',
                    id: 'email',
                    name: 'email',
                    required: true,
                    autoComplete: 'email',
                  }),
                ),
                div(
                  { class: 'form-group' },
                  label({ for: 'password' }, 'Password'),
                  input({
                    type: 'password',
                    id: 'password',
                    name: 'password',
                    required: true,
                    autoComplete: 'new-password',
                  }),
                ),
                button({ type: 'submit', class: 'btn' }, 'Register'),
              ),
              p(
                { style: { marginTop: '1.5rem' } },
                'Already have an account? ',
                a({ href: routes.auth.login.index.href() }, 'Login here'),
              ),
            ),
          ),
        )
      },

      async action({ request, formData }) {
        let name = formData.get('name')?.toString() ?? ''
        let email = formData.get('email')?.toString() ?? ''
        let password = formData.get('password')?.toString() ?? ''

        // Check if user already exists
        if (getUserByEmail(email)) {
          return render(
            Document$(
              div(
                { class: 'card', style: { maxWidth: '500px', margin: '2rem auto' } },
                div({ class: 'alert alert-error' }, 'An account with this email already exists.'),
                p$(
                  a({ href: routes.auth.register.index.href(), class: 'btn' }, 'Back to Register'),
                  a(
                    {
                      href: routes.auth.login.index.href(),
                      class: 'btn btn-secondary',
                      style: { marginLeft: '0.5rem' },
                    },
                    'Login',
                  ),
                ),
              ),
            ),
            { status: 400 },
          )
        }

        let user = createUser(email, password, name)

        let session = getSession(request)
        login(session.sessionId, user)

        let headers = new Headers()
        setSessionCookie(headers, session.sessionId)

        return redirect(routes.account.index.href(), { headers })
      },
    },

    logout({ request }) {
      let session = getSession(request)
      logout(session.sessionId)

      return redirect(routes.home.href())
    },

    forgotPassword: {
      index() {
        return render(
          Document$(
            div(
              { class: 'card', style: { maxWidth: '500px', margin: '2rem auto' } },
              h1$('Forgot Password'),
              p$("Enter your email address and we'll send you a link to reset your password."),
              form(
                { method: 'POST', action: routes.auth.forgotPassword.action.href() },
                div(
                  { class: 'form-group' },
                  label({ for: 'email' }, 'Email'),
                  input({
                    type: 'email',
                    id: 'email',
                    name: 'email',
                    required: true,
                    autoComplete: 'email',
                  }),
                ),
                button({ type: 'submit', class: 'btn' }, 'Send Reset Link'),
              ),
              p(
                { style: { marginTop: '1.5rem' } },
                a({ href: routes.auth.login.index.href() }, 'Back to Login'),
              ),
            ),
          ),
        )
      },

      async action({ formData }) {
        let email = formData.get('email')?.toString() ?? ''
        let token = createPasswordResetToken(email)

        return render(
          Document$(
            div(
              { class: 'card', style: { maxWidth: '500px', margin: '2rem auto' } },
              div({ class: 'alert alert-success' }, 'Password reset link sent! Check your email.'),
              token
                ? div(
                    {
                      style: {
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#f8f9fa',
                        borderRadius: '4px',
                      },
                    },
                    p(
                      { style: { fontSize: '0.9rem' } },
                      strong$('Demo Mode: '),
                      'Click the link below to reset your password',
                    ),
                    p(
                      { style: { marginTop: '0.5rem' } },
                      a(
                        {
                          href: routes.auth.resetPassword.index.href({ token }),
                          class: 'btn btn-secondary',
                        },
                        'Reset Password',
                      ),
                    ),
                  )
                : null,
              p(
                { style: { marginTop: '1.5rem' } },
                a({ href: routes.auth.login.index.href() }, 'Back to Login'),
              ),
            ),
          ),
        )
      },
    },

    resetPassword: {
      index({ params }) {
        let token = params.token

        return render(
          Document$(
            div(
              { class: 'card', style: { maxWidth: '500px', margin: '2rem auto' } },
              h1$('Reset Password'),
              p$('Enter your new password below.'),
              form(
                { method: 'POST', action: routes.auth.resetPassword.action.href({ token }) },
                div(
                  { class: 'form-group' },
                  label({ for: 'password' }, 'New Password'),
                  input({
                    type: 'password',
                    id: 'password',
                    name: 'password',
                    required: true,
                    autoComplete: 'new-password',
                  }),
                ),
                div(
                  { class: 'form-group' },
                  label({ for: 'confirmPassword' }, 'Confirm Password'),
                  input({
                    type: 'password',
                    id: 'confirmPassword',
                    name: 'confirmPassword',
                    required: true,
                    autoComplete: 'new-password',
                  }),
                ),
                button({ type: 'submit', class: 'btn' }, 'Reset Password'),
              ),
            ),
          ),
        )
      },

      async action({ formData, params }) {
        let password = formData.get('password')?.toString() ?? ''
        let confirmPassword = formData.get('confirmPassword')?.toString() ?? ''

        if (password !== confirmPassword) {
          return render(
            Document$(
              div(
                { class: 'card', style: { maxWidth: '500px', margin: '2rem auto' } },
                div({ class: 'alert alert-error' }, 'Passwords do not match.'),
                p$(
                  a(
                    {
                      href: routes.auth.resetPassword.index.href({ token: params.token }),
                      class: 'btn',
                    },
                    'Try Again',
                  ),
                ),
              ),
            ),
            { status: 400 },
          )
        }

        let success = resetPassword(params.token, password)

        if (!success) {
          return render(
            Document$(
              div(
                { class: 'card', style: { maxWidth: '500px', margin: '2rem auto' } },
                div({ class: 'alert alert-error' }, 'Invalid or expired reset token.'),
                p$(
                  a(
                    { href: routes.auth.forgotPassword.index.href(), class: 'btn' },
                    'Request New Link',
                  ),
                ),
              ),
            ),
            { status: 400 },
          )
        }

        return render(
          Document$(
            div(
              { class: 'card', style: { maxWidth: '500px', margin: '2rem auto' } },
              div(
                { class: 'alert alert-success' },
                'Password reset successfully! You can now login with your new password.',
              ),
              p$(a({ href: routes.auth.login.index.href(), class: 'btn' }, 'Login')),
            ),
          ),
        )
      },
    },
  },
} satisfies RouteHandlers<typeof routes.auth>
