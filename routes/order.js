import express from "express";
import orderModel from "../models/order.js";
const router = express.Router()

// GET ALL ORDER
router.get('/', async (req, res) => {
    try {
        const order = await orderModel
            .find()
            .populate('product', ['name', 'price'])
        const count = order.length
        if (count === 0) {
            return res.json({
                msg: '등록된 오더가 없습니다'
            })
        }

        res.json({
            msg:'get order',
            count,
            order
        })
    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
})

// GET SINGLE ORDER
router.get('/:orderId', async (req, res) => {

    const { orderId } = req.params

    try {
        const order = await orderModel
            .findById(orderId)
            .populate('product',['name', 'price'])
        res.json({
            msg: 'get single order',
            order
        })
    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
})


// POST SINGLE ORDER
router.post('/', async (req, res) => {

    const { product, qty, desc } = req.body

    try {

        const newOrder = new orderModel({
            product, qty, desc
        })

        const createdOrder = await newOrder.save()

        res.json({
            msg: 'post order',
            order: createdOrder
        })
    } catch (err) {
        res.status(500)
        throw new Error(err.message) // json 형태로 에러 전송
    }
})

// PUT SINGLE ORDER
router.put('/:orderId', async (req, res) => {

    const { orderId } = req.params

    const { product, qty, desc } = req.body

    const order = await orderModel.findById(orderId)

    if(order) {
        order.product = product ? product : order.product
        order.qty = qty ? qty : order.qty
        order.desc = desc ? desc : order.desc
        await order.save()

        return res.json({
            msg: `update order by ${orderId}`
        })
    } else {
        res.status(404)
        throw new Error('order not found')
    }
})

// DELETE ALL ORDER
router.delete('/', async (req, res) => {
    try {
        await orderModel.deleteMany()
        res.json({
            msg : 'delete all order'
        })
    } catch (err) {

    }
})

// DELETE SINGLE ORDER
router.delete('/:orderId', async (req, res) => {

    const { orderId } = req.params
    

    try {
        await orderModel.findByIdAndDelete(orderId)

        res.json({
            msg: 'delete id' + `${orderId}`
        })
    } catch (err) {
        console.error(err.message)
    }
})


export default router