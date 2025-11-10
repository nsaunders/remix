import type { BuildRouteHandler, RouteHandlers } from '@remix-run/fetch-router'

import { routes } from '../routes.ts'

import { Layout$ } from './layout.ts'
import { loadAuth } from './middleware/auth.ts'
import { searchBooks } from './models/books.ts'
import { render } from './utils/render.ts'
import {
  a,
  button,
  div,
  form,
  Frame,
  h1$,
  h2,
  input,
  label,
  li$,
  p,
  p$,
  strong$,
  textarea,
  ul,
} from './renuel.ts'

export let home: BuildRouteHandler<'GET', typeof routes.home> = {
  middleware: [loadAuth],
  handler() {
    return render(
      Layout$(
        div(
          { class: 'card' },
          h1$('Welcome to the Bookstore'),
          p(
            { style: { margin: '1rem 0' } },
            'Discover your next favorite book from our curated collection of fiction, non-fiction, and more.',
          ),
          p$(a({ href: routes.books.index.href(), class: 'btn' }, 'Browse Books')),
        ),
        h2({ style: { margin: '2rem 0 1rem' } }, 'Featured Books'),
        div(
          { className: 'grid' },
          Frame({ src: routes.fragments.bookCard.href({ slug: 'bbq' }) }),
          Frame({ src: routes.fragments.bookCard.href({ slug: 'heavy-metal' }) }),
          Frame({ src: routes.fragments.bookCard.href({ slug: 'three-ways' }) }),
        ),
      ),
    )
  },
}

export let about: BuildRouteHandler<'GET', typeof routes.about> = {
  middleware: [loadAuth],
  handler() {
    return render(
      Layout$(
        div(
          { className: 'card' },
          h1$('About Our Bookstore'),
          p(
            { style: { margin: '1rem 0' } },
            'Welcome to our online bookstore, a demo application built to showcase the capabilities of ',
            strong$('fetch-router'),
            ' - a powerful, type-safe routing library for web applications.',
          ),

          h2({ style: { margin: '1.5rem 0 0.5rem' } }, 'What This Demo Shows'),
          ul(
            { style: { marginLeft: '2rem', lineHeight: 2 } },
            li$(strong$('Resource Routes:'), ' Full RESTful CRUD operations'),
            li$(strong$('Nested Routes:'), ' Deep route hierarchies with type safety'),
            li$(strong$('Custom Parameters:'), ' Flexible parameter naming (slug, orderId, etc.)'),
            li$(strong$('HTTP Methods:'), ' GET, POST, PUT, DELETE properly used'),
            li$(strong$('Middleware:'), ' Authentication and authorization'),
            li$(strong$('Type Safety:'), ' End-to-end type checking for routes and handlers'),
          ),

          h2({ style: { margin: '1.5rem 0 0.5rem' } }, 'Try It Out'),
          p(
            { style: { margin: '1rem 0' } },
            'Explore the site to see all these features in action. You can browse books, create an account, add items to your cart, and even access the admin panel (login as admin@bookstore.com / admin123).',
          ),

          p(
            { style: { marginTop: '2rem' } },
            a({ href: routes.books.index.href(), className: 'btn' }, 'Explore Books'),
            a(
              {
                href: routes.auth.register.index.href(),
                className: 'btn btn-secondary',
                style: { marginLeft: '1rem' },
              },
              'Create Account',
            ),
          ),
        ),
      ),
    )
  },
}

export let contact: RouteHandlers<typeof routes.contact> = {
  middleware: [loadAuth],
  handlers: {
    index() {
      return render(
        Layout$(
          div(
            { className: 'card' },
            h1$('Contact Us'),
            p(
              { style: { margin: '1rem 0' } },
              "Have a question or feedback? We'd love to hear from you!",
            ),
            form(
              { method: 'POST', action: routes.contact.action.href() },
              div(
                { className: 'form-group' },
                label({ htmlFor: 'name' }, 'Name'),
                input({ type: 'text', id: 'name', name: 'name', required: true }),
              ),
              div(
                { className: 'form-group' },
                label({ htmlFor: 'email' }, 'Email'),
                input({ type: 'email', id: 'email', name: 'email', required: true }),
              ),
              div(
                { className: 'form-group' },
                label({ htmlFor: 'message' }, 'Message'),
                textarea({ id: 'message', name: 'message', required: true }),
              ),
              button({ type: 'submit', className: 'btn' }, 'Send Message'),
            ),
          ),
        ),
      )
    },

    async action() {
      return render(
        Layout$(
          div(
            { className: 'alert alert-success' },
            "Thank you for your message! We'll get back to you soon.",
          ),
          div(
            { className: 'card' },
            p$(a({ href: routes.home.href(), className: 'btn' }, 'Return Home')),
          ),
        ),
      )
    },
  },
}

export let search: BuildRouteHandler<'GET', typeof routes.search> = {
  middleware: [loadAuth],
  handler({ url }) {
    let query = url.searchParams.get('q') ?? ''
    let books = query ? searchBooks(query) : []

    return render(
      Layout$(
        h1$('Search Results'),

        // Search Form Card
        div(
          { className: 'card', style: { marginBottom: '2rem' } },
          form(
            {
              action: routes.search.href(),
              method: 'GET',
              style: { display: 'flex', gap: '0.5rem' },
            },
            input({
              type: 'search',
              name: 'q',
              placeholder: 'Search books...',
              value: query,
              css: { flex: 1, padding: '0.5rem' },
            }),
            button({ type: 'submit', className: 'btn' }, 'Search'),
          ),
        ),

        // Search Summary (Conditional)
        query
          ? p(
              { style: { marginBottom: '1rem' } },
              'Found ',
              books.length,
              ' result(s) for "',
              query,
              '"',
            )
          : null,

        // Results Grid (Conditional)
        div(
          { className: 'grid' },
          books.length > 0
            ? books.map((book) =>
                Frame({
                  key: book.slug, // Added key for list mapping
                  src: routes.fragments.bookCard.href({ slug: book.slug }),
                }),
              )
            : p$('No books found matching your search.'),
        ),
      ),
    )
  },
}
