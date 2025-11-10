import type { RouteHandlers } from '@remix-run/fetch-router'
import { redirect } from '@remix-run/fetch-router/response-helpers'

import { routes } from '../routes.ts'
import { getAllBooks, getBookById, createBook, updateBook, deleteBook } from './models/books.ts'
import { Layout$ } from './layout.ts'
import { render } from './utils/render.ts'
import { RestfulForm } from './components/restful-form.ts'
import {
  a,
  button,
  div,
  form,
  h1$,
  img,
  input,
  label,
  option,
  p,
  p$,
  select,
  small,
  span,
  strong$,
  table$,
  tbody$,
  td,
  td$,
  textarea,
  th$,
  thead,
  thead$,
  tr$,
} from './renuel.ts'

export default {
  index() {
    let books = getAllBooks()

    return render(
      Layout$(
        h1$('Manage Books'),
        p(
          { style: { marginBottom: '1rem' } },
          a({ href: routes.admin.books.new.href(), class: 'btn' }, 'Add New Book'),
          a(
            {
              href: routes.admin.index.href(),
              class: 'btn btn-secondary',
              style: { marginLeft: '0.5rem' },
            },
            'Back to Dashboard',
          ),
        ),
        div(
          { class: 'card' },
          table$(
            thead$(
              tr$(
                th$('Title'),
                th$('Author'),
                th$('Genre'),
                th$('Price'),
                th$('Stock'),
                th$('Actions'),
              ),
            ),
            tbody$(
              books.map((book) =>
                tr$(
                  td$(book.title),
                  td$(book.author),
                  td$(book.genre),
                  td$(book.price.toFixed(2)),
                  td$(
                    span(
                      { class: `badge ${book.inStock ? 'badge-success' : 'badge-warning'}` },
                      book.inStock ? 'Yes' : 'No',
                    ),
                  ),
                  td(
                    { class: 'actions' },
                    a(
                      {
                        href: routes.admin.books.edit.href({ bookId: book.id }),
                        class: 'btn btn-secondary',
                        style: { fontSize: '0.875rem', padding: '0.25rem 0.5rem' },
                      },
                      'Edit',
                    ),
                    RestfulForm(
                      {
                        method: 'DELETE',
                        action: routes.admin.books.destroy.href({ bookId: book.id }),
                        style: { display: 'inline' },
                      },
                      button(
                        {
                          type: 'submit',
                          class: 'btn btn-danger',
                          style: { fontSize: '0.875rem', padding: '0.25rem 0.5rem' },
                        },
                        'Delete',
                      ),
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
    let book = getBookById(params.bookId)

    if (!book) {
      return render(Layout$(div({ class: 'card' }, h1$('Book Not Found'))), { status: 404 })
    }

    return render(
      Layout$(
        h1$('Book Details'),
        div(
          { className: 'card' },
          p$(strong$('Title: '), book.title),
          p$(strong$('Author: '), book.author),
          p$(strong$('Slug: '), book.slug),
          p$(strong$('Description: '), book.description),
          p$(strong$('Price: '), '$', book.price.toFixed(2)),
          p$(strong$('Genre: '), book.genre),
          p$(strong$('ISBN: '), book.isbn),
          p$(strong$('Published: '), book.publishedYear),
          p$(
            strong$('In Stock: '),
            ' ',
            span(
              {
                className: `badge ${book.inStock ? 'badge-success' : 'badge-warning'}`,
              },
              book.inStock ? 'Yes' : 'No',
            ),
          ),
          div(
            { style: { marginTop: '2rem' } },
            a(
              {
                href: routes.admin.books.edit.href({ bookId: book.id }),
                className: 'btn',
              },
              'Edit',
            ),
            a(
              {
                href: routes.admin.books.index.href(),
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

  new() {
    return render(
      Layout$(
        h1$('Add New Book'),
        div(
          { className: 'card' },
          form(
            {
              method: 'POST',
              action: routes.admin.books.create.href(),
              encType: 'multipart/form-data',
            },
            div(
              { className: 'form-group' },
              label({ htmlFor: 'title' }, 'Title'),
              input({ type: 'text', id: 'title', name: 'title', required: true }),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'author' }, 'Author'),
              input({ type: 'text', id: 'author', name: 'author', required: true }),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'slug' }, 'Slug (URL-friendly name)'),
              input({ type: 'text', id: 'slug', name: 'slug', required: true }),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'description' }, 'Description'),
              textarea({ id: 'description', name: 'description', required: true }),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'price' }, 'Price'),
              input({ type: 'number', id: 'price', name: 'price', step: '0.01', required: true }),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'genre' }, 'Genre'),
              input({ type: 'text', id: 'genre', name: 'genre', required: true }),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'isbn' }, 'ISBN'),
              input({ type: 'text', id: 'isbn', name: 'isbn', required: true }),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'publishedYear' }, 'Published Year'),
              input({ type: 'number', id: 'publishedYear', name: 'publishedYear', required: true }),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'inStock' }, 'In Stock'),
              select(
                { id: 'inStock', name: 'inStock' },
                option({ value: 'true' }, 'Yes'),
                option({ value: 'false' }, 'No'),
              ),
            ),
            div(
              { className: 'form-group' },
              label({ htmlFor: 'cover' }, 'Book Cover Image'),
              input({ type: 'file', id: 'cover', name: 'cover', accept: 'image/*' }),
              small({ style: { color: '#666' } }, 'Optional. Upload a cover image for this book.'),
            ),
            button({ type: 'submit', className: 'btn' }, 'Create Book'),
            a(
              {
                href: routes.admin.books.index.href(),
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

  async create({ formData }) {
    createBook({
      slug: formData.get('slug')?.toString() ?? '',
      title: formData.get('title')?.toString() ?? '',
      author: formData.get('author')?.toString() ?? '',
      description: formData.get('description')?.toString() ?? '',
      price: parseFloat(formData.get('price')?.toString() ?? '0'),
      genre: formData.get('genre')?.toString() ?? '',
      coverUrl: formData.get('cover')?.toString() ?? '/images/placeholder.jpg',
      imageUrls: [],
      isbn: formData.get('isbn')?.toString() ?? '',
      publishedYear: parseInt(formData.get('publishedYear')?.toString() ?? '2024', 10),
      inStock: formData.get('inStock')?.toString() === 'true',
    })

    return redirect(routes.admin.books.index.href())
  },

  edit({ params }) {
    let book = getBookById(params.bookId)

    if (!book) {
      return render(Layout$(div({ class: 'card' }, h1$('Book Not Found'))), { status: 404 })
    }

    return render(
      Layout$(
        h1$('Edit Book'),
        div(
          { class: 'card' },
          RestfulForm(
            {
              method: 'PUT',
              action: routes.admin.books.update.href({ bookId: book.id }),
              encType: 'multipart/form-data',
            },
            div(
              { class: 'form-group' },
              label({ for: 'title' }, 'Title'),
              input({
                type: 'text',
                id: 'title',
                name: 'title',
                value: book.title,
                required: true,
              }),
            ),
            div(
              { class: 'form-group' },
              label({ for: 'author' }, 'Author'),
              input({
                type: 'text',
                id: 'author',
                name: 'author',
                value: book.author,
                required: true,
              }),
            ),
            div(
              { class: 'form-group' },
              label({ for: 'slug' }, 'Slug (URL-friendly name)'),
              input({
                type: 'text',
                id: 'slug',
                name: 'slug',
                value: book.slug,
                required: true,
              }),
            ),
            div(
              { class: 'form-group' },
              label({ for: 'description' }, 'Description'),
              textarea(
                { id: 'description', name: 'description', required: true },
                book.description,
              ),
            ),
            div(
              { class: 'form-group' },
              label({ for: 'price' }, 'Price'),
              input({
                type: 'number',
                id: 'price',
                name: 'price',
                step: '0.01',
                value: book.price,
                required: true,
              }),
            ),
            div(
              { class: 'form-group' },
              label({ for: 'genre' }, 'Genre'),
              input({
                type: 'text',
                id: 'genre',
                name: 'genre',
                value: book.genre,
                required: true,
              }),
            ),
            div(
              { class: 'form-group' },
              label({ for: 'isbn' }, 'ISBN'),
              input({
                type: 'text',
                id: 'isbn',
                name: 'isbn',
                value: book.isbn,
                required: true,
              }),
            ),
            div(
              { class: 'form-group' },
              label({ for: 'publishedYear' }, 'Published Year'),
              input({
                type: 'number',
                id: 'publishedYear',
                name: 'publishedYear',
                value: book.publishedYear,
                required: true,
              }),
            ),
            div(
              { class: 'form-group' },
              label({ for: 'inStock' }, 'In Stock'),
              select(
                {
                  id: 'inStock',
                  name: 'inStock',
                },
                option({ value: 'true' }, 'Yes'),
                option({ value: 'false' }, 'No'),
              ),
            ),
            div(
              { class: 'form-group' },
              label({ for: 'cover' }, 'Book Cover Image'),
              book.coverUrl !== '/images/placeholder.jpg' &&
                div(
                  { style: { marginTop: '0.5rem' } },
                  img({
                    src: book.coverUrl,
                    alt: book.title,
                    style: { maxWidth: '200px', height: 'auto', borderRadius: '4px' },
                  }),
                  p({ style: { fontSize: '0.875rem', color: '#666' } }, 'Current cover image'),
                ),
              input({ type: 'file', id: 'cover', name: 'cover', accept: 'image/*' }),
              small(
                { style: { color: '#666' } },
                'Optional. Upload a new cover image to replace the current one.',
              ),
            ),
            button({ type: 'submit', class: 'btn' }, 'Update Book'),
            a(
              {
                href: routes.admin.books.index.href(),
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

  async update({ formData, params }) {
    let book = getBookById(params.bookId)
    if (!book) {
      return new Response('Book not found', { status: 404 })
    }

    // The uploadHandler automatically saves the file and returns the URL path
    // If no file was uploaded, the form field will be empty and we keep the existing coverUrl
    let coverUrl = formData.get('cover')?.toString() || book.coverUrl

    updateBook(params.bookId, {
      slug: formData.get('slug')?.toString() ?? '',
      title: formData.get('title')?.toString() ?? '',
      author: formData.get('author')?.toString() ?? '',
      description: formData.get('description')?.toString() ?? '',
      price: parseFloat(formData.get('price')?.toString() ?? '0'),
      genre: formData.get('genre')?.toString() ?? '',
      coverUrl,
      isbn: formData.get('isbn')?.toString() ?? '',
      publishedYear: parseInt(formData.get('publishedYear')?.toString() ?? '2024', 10),
      inStock: formData.get('inStock')?.toString() === 'true',
    })

    return redirect(routes.admin.books.index.href())
  },

  destroy({ params }) {
    deleteBook(params.bookId)

    return redirect(routes.admin.books.index.href())
  },
} satisfies RouteHandlers<typeof routes.admin.books>
