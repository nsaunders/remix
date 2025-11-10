import { createRouter } from '@remix-run/fetch-router'
import { asyncContext } from '@remix-run/fetch-router/async-context-middleware'
import { formData } from '@remix-run/fetch-router/form-data-middleware'
import { logger } from '@remix-run/fetch-router/logger-middleware'
import { methodOverride } from '@remix-run/fetch-router/method-override-middleware'

import { routes } from '../routes.ts'
import { uploadHandler } from './utils/uploads.ts'

import adminHandlers from './admin.ts'
import accountHandlers from './account.ts'
import authHandlers from './auth.ts'
import booksHandlers from './books.ts'
import cartHandlers from './cart.ts'
import checkoutHandlers from './checkout.ts'
import fragmentsHandlers from './fragments.ts'
import * as publicHandlers from './public.ts'
import * as marketingHandlers from './marketing.ts'
import { uploadsHandler } from './uploads.ts'

let middleware = []

if (process.env.NODE_ENV === 'development') {
  middleware.push(logger())
}

middleware.push(formData({ uploadHandler }))
middleware.push(methodOverride())
middleware.push(asyncContext())

export let router = createRouter({ middleware })

router.get(routes.assets, publicHandlers.assets)
router.get(routes.images, publicHandlers.images)
router.get(routes.uploads, uploadsHandler)

router.map(routes.home, marketingHandlers.home)
router.map(routes.about, marketingHandlers.about)
router.map(routes.contact, marketingHandlers.contact)
router.map(routes.search, marketingHandlers.search)

router.map(routes.fragments, fragmentsHandlers)

router.map(routes.books, booksHandlers)
router.map(routes.auth, authHandlers)
router.map(routes.cart, cartHandlers)
router.map(routes.account, accountHandlers)
router.map(routes.checkout, checkoutHandlers)
router.map(routes.admin, adminHandlers)
