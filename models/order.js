import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number
        },
        description: {
            type: String
        },
        Category: {
            type: String
        }
    },
    {
     timestamps: true
    }
)

const orderModel = mongoose.model('order',orderSchema)

export default orderModel