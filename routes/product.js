import express from "express";
import productModel from "../models/product.js";

const router = express.Router()

// CRUD


// 전체 Product 불러오기
router.get('/', async (req, res) => {
    try {
        const products = await productModel.find()
        console.log(products)
        res.json({
            msg: 'get product',
            count: products.length,
            products
        })
    } catch (err) {

    }
})

// 상세 Product를 가져오기
router.get('/:productId', async (req, res) => {
    const { productId } = req.params
    try {
        const product = await productModel.findById(productId)
        if (!product) {
            res.json({
                msg : 'no product'
            })
        }
        res.json({
            msg : 'successful get product',
            product
        })
    } catch (err) {
        console.error(err.message)
    }
})


// product 등록하기

router.post('/', async (req, res) => {
    const {name, price, description, category} = req.body

    try {
        const newProduct = new productModel({
            name,
            price,
            description,
            category
        })
        const createdProduct = await newProduct.save()

        // const newProduct = {
        //     name : req.body.productName,
        //     price : req.body.productPrice,
        //     desc : req.body.productDesc,
        //     category : req.body.productCategory
        // }
        res.json({
            msg: 'post product',
            product: createdProduct
        })
    } catch (err) {
         console.error(err.message)
    }
})

// product 수정하기
router.put('/:productId', async (req, res) => {

    const { productId } = req.params

    const {productName, productPrice, productDescription, productCategory} = req.body

    try {
        await productModel.updateOne({"_id":productId},{"$set":{
            name:productName,
            price:productPrice,
            description:productDescription,
            category:productCategory
            }})
        res.json({
            msg: 'update product',
        })
    } catch (err) {
        console.error(err.message)
    }
})

// 상세 product 삭제하기

router.delete('/:productId', async (req, res) => {
    const { productId } = req.params
    try {
        await productModel.findByIdAndDelete(productId)
        res.json({
            msg:`deleted product at ${productId}`
        })
    } catch (err) {

    }
})

// 전체 product 삭제하기
router.delete('/', async (req, res) => {
    try {
        await productModel.deleteMany()
        res.json({
            msg : 'deleted all products'
        })
    } catch (err) {
        console.error(err.message)
    }
})


export default router