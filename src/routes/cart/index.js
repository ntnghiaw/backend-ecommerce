'use strict'

const express = require('express')
const router = express.Router()
const cartController = require('../../controllers/cart.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

// get amount discount
router.post('/', asyncHandler(cartController.addProduct))
router.patch('/', asyncHandler(cartController.updateQuantity))
router.get('/', asyncHandler(cartController.getUserCart))
router.delete('', asyncHandler(cartController.removeProduct))



module.exports = router