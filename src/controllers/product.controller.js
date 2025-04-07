'use strict'


const ProductService = require('../services/product.service')

const { CREATED, SuccessResponse } = require('../core/success.response')

class ProductController {
  createProduct = async (req, res, next) => {
    return new CREATED({
      message: 'Create product success',
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res)
  }

  // PUT ///
  publishProduct = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Publish product success',
      metadata: await ProductService.publishProductByShop({
        productId: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res)
  }

  unpublishProduct = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Unpublish product success',
      metadata: await ProductService.unpublishProductByShop({
        productId: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res)
  }

  updateProduct = async (req, res, next) => {
     return new SuccessResponse({
       message: 'Unpublish product success',
       metadata: await ProductService.updateProduct({
         productId: req.params.id,
         payload: {
            ...req.body,
            product_shop: req.user.userId
         },
       }),
     }).send(res)
  }

  // QUERY ///
  /**
   * @description Get all draft products for shop
   * @param {String} product_shop - product shop id
   * @returns List of draft products for shop
   */
  getAllDraftsForShop = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get all draft products success',
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res)
  }

  getAllPublishForShop = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get all published products success',
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res)
  }

  searchProducts = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Result search products success',
      metadata: await ProductService.searchProducts({ keySearch: req.query.keySearch }),
    }).send(res)
  }

  findAllProducts = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get all  products success',
      metadata: await ProductService.findProducts({}),
    }).send(res)
  }

  findProductById = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get   product success',
      metadata: await ProductService.findProductById({
        product_id: req.params.id,
      }),
    }).send(res)
  }
}

module.exports = new ProductController()