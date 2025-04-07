'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model')
const { BadRequestError, NotFoundError } = require('../core/error.response')
const {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductByShop,
  unpublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findProductById,
  updateProductById,
  getTypeOfProduct,
} = require('../models/repositories/product.repo')
const { removeUndefinedObject, nestedObjectParser } = require('../utils')
const { insertInventory } = require('../models/repositories/inventory.repo')



// define Factory class to create product

class ProductFactory {
  static productRegistry = {}

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Product type ${type} not registered`)
    return await new productClass(payload).createProduct()
  }

  static async publishProductByShop({ productId, product_shop }) {
    return await publishProductByShop({ productId, product_shop })
  }

  static async unpublishProductByShop({ productId, product_shop }) {
    return await unpublishProductByShop({ productId, product_shop })
  }

  static async updateProduct({productId, payload}) {

    const type = await getTypeOfProduct({ productId })
    if (!type) throw new NotFoundError(`Not found product`)
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Product type ${type} not registered`)
    return await new productClass(payload).updateProduct(productId)
  }
  

  // QUERY ///
  static async searchProducts({ keySearch }) {
    return await searchProductsByUser({ keySearch })
  }

  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true }
    return await findAllDraftsForShop({ query, limit, skip })
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true }
    return await findAllPublishForShop({ query, limit, skip })
  }

  static async findProducts({
    limit = 50,
    sort = 'ctime',
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ['product_name', 'product_thumb', 'product_price'],
    })
  }

  static async findProductById({ product_id }) {
    return await findProductById({ product_id, unselect: ['__v'] })
  }
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
  }

  // Create a new product
  async createProduct(_id) {
    const newProduct =  await product.create({ _id, ...this })
    // add to inventory
    if (newProduct) {
      await insertInventory({
        productId: newProduct._id,
        stock: this.product_quantity,
        shopId: this.product_shop,
      })

    }
    return newProduct
  }

  // Update a product
  async updateProduct({productId, payload}) {
    return await updateProductById({
      productId,
      product_shop: this.product_shop,
      payload,
      model: product
    })
  }
}

// define sub-class for different product types - Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    })
    if (!newClothing) throw new BadRequestError('Cannot create new clothing')

    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct) throw new BadRequestError('Cannot create new product')

    return newProduct
  }

  async updateProduct(productId) {
    // remove null and undefined values from payload
    const objectParams = removeUndefinedObject(this)
    // check if product_attributes exist -> update sub-product class
    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        product_shop: objectParams.product_shop,
        payload: {
          ...objectParams.product_attributes,
        },
        model: clothing,
      })
    }
    
    // parser nested object for query update
    const updatedProduct = await super.updateProduct({
      productId,
      payload: nestedObjectParser(objectParams),
    })


    return updatedProduct
  }
}

// define sub-class for different product types - Electronic
class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    })
    if (!newElectronic) throw new BadRequestError('Cannot create new electronic')

    const newProduct = await super.createProduct(newElectronic._id)
    if (!newProduct) throw new BadRequestError('Cannot create new product')

    return newProduct
  }

  async updateProduct(productId) {
    // remove null and undefined values from payload
    const objectParams = removeUndefinedObject(this)
    // check if product_attributes exist -> update sub-product class
    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        payload: {
          ...objectParams.product_attributes,
        },
        model: electronic,
      })
    }

    // parser nested object for query update
    const updatedProduct = await super.updateProduct({
      productId,
      payload: nestedObjectParser(objectParams),
    })

    return updatedProduct
  }
}

// define sub-class for different product types - Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    })
    if (!newFurniture) throw new BadRequestError('Cannot create new furnitures')

    const newProduct = await super.createProduct(newFurniture._id)
    if (!newProduct) throw new BadRequestError('Cannot create new product')

    return newProduct
  }

  async updateProduct(productId) {
    // remove null and undefined values from payload
    const objectParams = removeUndefinedObject(this)
    // check if product_attributes exist -> update sub-product class
    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        product_shop: objectParams.product_shop,
        payload: {
          ...objectParams.product_attributes,
        },
        model: furniture,
      })
    }

    // parser nested object for query update
    const updatedProduct = await super.updateProduct({
      productId,
      product_shop: objectParams.product_shop,
      payload: nestedObjectParser(objectParams),
    })

    return updatedProduct
  }
}

ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory
