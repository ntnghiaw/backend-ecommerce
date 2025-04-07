'use strict'

const { Schema, model } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'inventories'

// Declare the Schema of the Mongo model
const inventorySchema = new Schema(
  {
    inven_shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    inven_productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    inven_location: {
      type: String,
      default: 'unknown',
    },
    inven_stock: {
      type: Number,
      required: true,
    },
    inven_reservations: {
      type: Array,
      default: [],
    }
    /* 
      cartId:
      quantity:
      createdOn
    */
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
)

//Export the model
module.exports = {
  inventory: model(DOCUMENT_NAME, inventorySchema),
}
