import { routes } from '../../routes.ts'

import { CartButton } from '../assets/cart-button.ts'
import type { Book } from '../models/books.ts'
import { a, component, div, h3$, img } from '../renuel.ts'

export interface BookCardProps {
  book: Book
  inCart: boolean
}

export const { BookCard } = component('BookCard', ({ book, inCart }: BookCardProps) =>
  div(
    { class: 'book-card' },
    img({ src: book.coverUrl, alt: book.title }),
    div(
      { class: 'book-card-body' },
      h3$(book.title),
      div({ class: 'author' }, `by ${book.author}`),
      div({ class: 'price' }, `$${book.price.toFixed(2)}`),
      div(
        { style: { display: 'flex', gap: '0.5rem', alignItems: 'center' } },
        a({ href: routes.books.show.href({ slug: book.slug }), class: 'btn' }, 'View Details'),
        CartButton({ inCart, id: book.id, slug: book.slug }),
      ),
    ),
  ),
)
