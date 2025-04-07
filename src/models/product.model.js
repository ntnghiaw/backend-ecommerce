'use strict'

const { Schema, model } = require('mongoose') // Erase if already required
const slugify = require('slugify')
const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'products'

// Declare the Schema of the Mongo model
const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true
    },
    product_thumb: {
      type: String,
      required: true
    },
    product_description: String,
    product_slug: String, // slugify product name
    product_price: {
      type: Number,
      required: true
    },
    product_quantity: {
      type: Number,
      required: true
    },
    product_type: {
      type: String,
      required: true,
      enum: ['Electronic', 'Clothing', 'Food', 'Furniture', 'Toy', 'Book', 'Sport', 'Beauty']
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true  
    },
    product_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    product_variations: {
      type: Array,
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false // not select when find product
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false 
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
)
// create index for text search
productSchema.index({ product_name: 'text', product_description: 'text' })


// Document middleware: runs  before save and create
productSchema.pre('save', function (next) {
  this.product_slug = slugify(this.product_name, {
    lower: true,
    locale: 'vi',
  }) 
  next()
})

productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate()
  if (update.product_name) {
    update.product_slug = slugify(update.product_name, {
      lower: true,
      locale: 'vi',
    })
    this.setUpdate(update) // ensure update is applied
  }
  next()
})


// define the product type = clothing
const clothingSchema = new Schema({
  brand: {
    type: String,
    required: true
  },
  size: String,
  material: String,
  product_shop: {
    type: Schema.Types.ObjectId,
    ref: 'Shop'
  },
}, {
  collection: 'clothes',
  timestamps: true
})


// define the product type = electronic
const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      required: true,
    },
    model: String,
    color: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
    },
  },
  {
    collection: 'electronics',
    timestamps: true,
  }
)

// define the product type = furniture
const furnitureSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
    },
  },
  {
    collection: 'furnitures',
    timestamps: true,
  }
)

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model('Clothing', clothingSchema),
  electronic: model('Electronic', electronicSchema),
  furniture: model('Furniture', furnitureSchema),
}


