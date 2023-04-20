import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        name: {
            type : String,
            required : true
        },
        price: {
            type: Number,
            default : 0
        },
        description: {
            type: String
        },
        category: {
            type: String
        }
    },
    {
        timestamps: true
    }

)

const productModel = mongoose.model('product', productSchema)

export default productModel