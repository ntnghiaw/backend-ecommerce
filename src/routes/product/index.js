'use strict'

const express = require('express')
const router = express.Router()
const productController = require('../../controllers/product.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

// search product by user
router.get('/search', asyncHandler(productController.searchProducts))
router.get('', asyncHandler(productController.findAllProducts))
router.get('/:id', asyncHandler(productController.findProductById))



// authentication
router.use(authenticationV2)

// create product
router.post('/', asyncHandler(productController.createProduct))
router.patch('/:id', asyncHandler(productController.updateProduct))

router.post('/publish/:id', asyncHandler(productController.publishProduct))
router.post('/unpublish/:id', asyncHandler(productController.unpublishProduct))

// QUERY ///
router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop))
router.get('/published/all', asyncHandler(productController.getAllPublishForShop))

module.exports = router