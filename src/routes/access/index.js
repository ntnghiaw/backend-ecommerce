'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()

// signup
router.post('/signup', asyncHandler(accessController.signup))

// login
router.post('/login', asyncHandler(accessController.login))


// authentication
router.use(authenticationV2)

// handle refresh token
router.post('/refreshToken', asyncHandler(accessController.handleRefreshToken))

// logout
router.post('/logout', asyncHandler(accessController.logout))

module.exports = router
