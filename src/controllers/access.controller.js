'use strict'

const AccessService = require('../services/access.service')
const { OK, CREATED, SuccessResponse } =  require('../core/success.response')


class AccessController {
  signup = async (req, res, next) => {
    return new CREATED({
      message: 'Sign up success',
      metadata: await AccessService.signUp(req.body),
    }).send(res)
  }

  login = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Login success',
      metadata: await AccessService.login(req.body),
    }).send(res)
  }

  logout = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Logout success',
      metadata: await AccessService.logout(req.keyStore),
    }).send(res)
  }

  handleRefreshToken = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get token success',
      metadata: await AccessService.handleRefreshToken({
        keyStore: req.keyStore,
        user: req.user,
        refreshToken: req.refreshToken,
      }),
    }).send(res)
  }
}

module.exports = new AccessController()
