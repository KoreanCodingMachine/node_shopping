import mongoose from "mongoose";
import product from "./product.js";
import user from "./user.js";

const orderSchema = mongoose.Schema(
    {
       product: {
           type:mongoose.Schema.Types.ObjectId,
           ref: 'product',
           required: true
       },
       user: {
            type: mongoose.Schema.Types.ObjectId,
            ref:  'user',
            required: true
       },
       qty: {
           type: Number,
           default: 1
       },
       desc: {
           type: String
       }

    },
    {
     timestamps: true
    }
)

const orderModel = mongoose.model('order',orderSchema)

export default orderModel