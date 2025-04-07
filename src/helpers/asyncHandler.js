'use strict'

/**
 * This function is used to catches the errors which can be thrown in Service  and Controller and passes them to the next middleware (error handler)
 */
const asyncHandler = (fn) => (req, res, next) =>  fn(req, res, next).catch(next)


module.exports = asyncHandler