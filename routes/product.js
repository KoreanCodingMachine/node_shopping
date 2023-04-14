import express from "express";
import productModel from "../models/product.js";

const router = express.Router()

// CRUD


// Product 불러오기
router.get('/', async (req, res) => {
    try {
        const products = await productModel.find()
        res.json({
            msg: 'get product',
            count: products.length,
            products
        })
    } catch (err) {

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
router.put('/', async (req, res) => {
    try {

        res.json({
            msg: 'update product',

        })
    } catch (err) {

    }
})

// product 삭제하기

router.delete('/', async (req, res) => {
    try {
        res.json({
            msg:'delete product'
        })
    } catch (err) {

    }
})



export default router