import mongoose from "mongoose";


const reviewSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        }
    },
    {
        timestamps: true
    }
)

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
        },
        reviews: [reviewSchema],
        numReviews: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }

)

const productModel = mongoose.model('product', productSchema)

export default productModel