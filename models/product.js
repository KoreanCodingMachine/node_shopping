import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        name: {
            type : string,
            required : true
        },
        price: {
            type: number,
            default : 0
        },
        description: {
            type: string
        },
        category: {
            type: string
        }
    },
    {
        timestamps: true
    }

)

const productModel = mongoose.model('product', productSchema)

export default productModel