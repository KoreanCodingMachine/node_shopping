import express from "express";
import productModel from "../models/product.js";

const router = express.Router()

// CRUD


// 전체 Product 불러오기
router.get('/', async (req, res) => {
    try {
        const products = await productModel.find()

        const count = products.length

        // products 가 존재한다면
        if (products) {
            return res.json({
                   msg: 'get all products',
                   count,
                   products
            })
        }

        res.status(404)
        throw new Error('no products')

    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
})

// 상세 Product를 가져오기
router.get('/:productId', async (req, res) => {

    const { productId } = req.params

    try {
        const product = await productModel.findById(productId)

        if (product) {
            return  res.json({
                    msg: 'get single product',
                    product
            })
        }

        res.status(404)
        throw new Error('no product')
    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }

})


// product 등록하기
router.post('/', async (req, res) => {

    const { name, price, description, category } = req.body

    try {
        const newProduct = new productModel({
            name,
            price,
            description,
            category
        })

        const createdProduct = await newProduct.save()

        res.json({
            msg: 'create product',
            createdProduct
        })

    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
})

// product 수정하기
router.put('/:productId', async (req, res) => {

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

        return res.json({
            msg: `update product ${productId}`
        })

    } else {
        res.status(500)
        throw new Error('no matched product')
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