import type { RouteHandlers } from '@remix-run/fetch-router'
import { routes } from '../routes.ts'

import { getAllBooks, getBookBySlug, getBooksByGenre, getAvailableGenres } from './models/books.ts'
import { Layout$ } from './layout.ts'
import { loadAuth } from './middleware/auth.ts'
import { render } from './utils/render.ts'
import { ImageCarousel } from './assets/image-carousel.ts'
import {
  Frame,
  a,
  button,
  div,
  div$,
  form,
  h1$,
  h3$,
  input,
  p,
  p$,
  span,
  strong$,
} from './renuel.ts'

export default {
  middleware: [loadAuth],
  handlers: {
    index() {
      let books = getAllBooks()
      let genres = getAvailableGenres()

      return render(
        Layout$(
          h1$('Browse Books'),
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
                placeholder: 'Search books by title, author, or description...',
                css: { flex: 1, padding: '0.5rem' }, // Note: Assuming 'css' prop is valid in this context
              }),
              button({ type: 'submit', className: 'btn' }, 'Search'),
            ),
          ),
          div(
            { className: 'card', style: { marginBottom: '2rem' } },
            h3$('Browse by Genre'),
            div(
              { style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' } },
              genres.map((genre) =>
                a(
                  {
                    key: genre,
                    href: routes.books.genre.href({ genre }),
                    className: 'btn btn-secondary',
                  },
                  genre,
                ),
              ),
            ),
          ),
          div(
            { className: 'grid' },
            books.map((book) =>
              Frame({
                key: book.slug,
                fallback: div$(`Loading ${book.slug}...`),
                src: routes.fragments.bookCard.href({ slug: book.slug }),
              }),
            ),
          ),
        ),
      )
    },

    genre({ params }) {
      let genre = params.genre
      let books = getBooksByGenre(genre)

      if (books.length === 0) {
        return render(
          Layout$(
            div(
              { class: 'card' },
              h1$('Genre Not Found'),
              p$(`No books found in the "${genre}" genre.`),
              p(
                { style: { marginTop: '1rem' } },
                a({ href: routes.books.index.href(), class: 'btn' }, 'Browse All Books'),
              ),
            ),
          ),
          { status: 404 },
        )
      }

      return render(
        Layout$(
          h1$(genre.charAt(0).toUpperCase() + genre.slice(1) + ' Books'),
          p(
            { style: { margin: '1rem 0' } },
            a({ href: routes.books.index.href(), class: 'btn btn-secondary' }, 'View All Books'),
          ),
          div(
            { className: 'grid', style: { marginTop: '2rem' } },
            books.map((book) =>
              Frame({
                key: book.slug,
                fallback: div$(`Loading ${book.slug}...`),
                src: routes.fragments.bookCard.href({ slug: book.slug }),
              }),
            ),
          ),
        ),
      )
    },

    show({ params }) {
      let book = getBookBySlug(params.slug)

      if (!book) {
        return render(Layout$(div({ class: 'card' }, h1$('Book Not Found'))), { status: 404 })
      }

      return render(
        Layout$(
          div(
            {
              style: {
                display: 'grid',
                gridTemplateColumns: '300px 1fr',
                gap: '2rem',
              },
            },
            // Left Column: Image Carousel
            div(
              {
                css: {
                  height: '400px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                },
              },
              ImageCarousel({ images: book.imageUrls }),
            ),

            // Right Column: Book Details
            div(
              { className: 'card' },
              h1$(book.title),
              p(
                { className: 'author', style: { fontSize: '1.2rem', margin: '0.5rem 0' } },
                'by ',
                book.author,
              ),
              p(
                { style: { margin: '1rem 0' } },
                span({ className: 'badge badge-info' }, book.genre),
                span(
                  {
                    className: `badge ${book.inStock ? 'badge-success' : 'badge-warning'}`,
                    style: { marginLeft: '0.5rem' },
                  },
                  book.inStock ? 'In Stock' : 'Out of Stock',
                ),
              ),
              p(
                { className: 'price', style: { fontSize: '2rem', margin: '1rem 0' } },
                '$',
                book.price.toFixed(2),
              ),
              p({ style: { margin: '1.5rem 0', lineHeight: 1.8 } }, book.description),
              div(
                {
                  style: {
                    margin: '1.5rem 0',
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '4px',
                  },
                },
                p$(strong$('ISBN: '), book.isbn),
                p$(strong$('Published: '), book.publishedYear),
              ),
              book.inStock
                ? form(
                    {
                      method: 'POST',
                      action: routes.cart.api.add.href(),
                      style: { marginTop: '2rem' },
                    },
                    input({ type: 'hidden', name: 'bookId', value: book.id }),
                    input({ type: 'hidden', name: 'slug', value: book.slug }),
                    button(
                      {
                        type: 'submit',
                        className: 'btn',
                        style: { fontSize: '1.1rem', padding: '0.75rem 1.5rem' },
                      },
                      'Add to Cart',
                    ),
                  )
                : p(
                    { style: { color: '#e74c3c', fontWeight: 500 } },
                    'This book is currently out of stock.',
                  ),
              p(
                { style: { marginTop: '1.5rem' } },
                a(
                  { href: routes.books.index.href(), className: 'btn btn-secondary' },
                  'Back to Books',
                ),
              ),
            ),
          ),
        ),
      )
    },
  },
} satisfies RouteHandlers<typeof routes.books>
