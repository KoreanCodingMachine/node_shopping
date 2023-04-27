import productModel from "../models/product.js";
import expressAsyncHandler from "express-async-handler";

const getAllProducts =  expressAsyncHandler(async (req, res) => {

        const pageSize = req.query.size

        const page = Number(req.query.pageNumber) || 1

        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i'
                }
            }
            : {}

        const count = await productModel.countDocuments({...keyword})

        const products = await productModel
            .find({...keyword})
            .limit(pageSize)
            .skip(pageSize * (page - 1))

        if (products.length === 0) {
            res.status(404)
            throw new Error('no product')
        }

        if (products) {
            return res.json({
                msg: 'get all producdts',
                total: products.length,
                products,
                page,
                pages: Math.ceil(count / pageSize)
            })
        }
})

const getAProduct =   expressAsyncHandler( async (req, res) => {

        const { productId } = req.params


        const product = await productModel.findById(productId)

        if (product) {
            return res.json({
                msg: 'get single product',
                product
            })
        }

        if (!product) {
           res.status(404)
           throw new Error('no product')
        }
})



const postProduct =  expressAsyncHandler(async (req, res) => {

        const { name, price, description, category } = req.body


        const newProduct = new productModel({
            name,
            price,
            description,
            category
        })

        const createdProduct = await newProduct.save()

        res.json({
            msg: 'post product',
            createdProduct
        })
})

const updateProduct = expressAsyncHandler(async (req, res) => {

    const { productId } = req.params

    const { name, price, description, category } = req.body

    const product = await productModel.findById(productId)

    // product가 있을 때
    // 입력 req.body에 담겨저오는 수정 값이 있다면 req.body 값으로 수정
    // 없다면 기존 product 값으로 수정

    if (product) {
        product.name = name ? name : product.name
        product.price = price ? price : product.price
        product.description = description ? description : product.description
        product.category = category ? category : product.category

        await product.save()

        return res.json({
            msg: `product updated by ${productId}`
        })
    }

})

const deleteAllProduct = expressAsyncHandler(async (req, res) => {

        await productModel.deleteMany()

        res.json({
            msg : 'deleted all products'
        })
})

const deleteAProduct = expressAsyncHandler(async (req, res) => {
        const { productId } = req.params

        await productModel.findByIdAndDelete(productId)
        res.json({
            msg:`deleted product at ${productId}`
        })

})

const getCategoryProduct = expressAsyncHandler( async (req, res) => {

        const { category } = req.query

        const categoryProduct = await productModel.find({category})

        if (category !== 'tv') {
            res.status(404)
            throw new Error('no mathced category')
        }

        if (categoryProduct){
            return  res.json({
                msg: 'get category',
                categoryProduct
            })     
        }


})


export { getAllProducts, getAProduct, postProduct, updateProduct, deleteAllProduct, deleteAProduct, getCategoryProduct }