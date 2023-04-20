import express from "express";
import orderModel from "../models/order.js";
const router = express.Router()

// GET ALL ORDER
router.get('/', async (req, res) => {
    try {
        const order = await orderModel.find()
        const count = order.length
        res.json({
            msg:'get order',
            count,
            order
        })
    } catch (err) {
        console.error(err.message)
    }
})

// GET SINGLE ORDER
router.get('/:orderId', async (req, res) => {

    const { orderId } = req.params

    try {
        const one = await orderModel.findById(orderId)
        res.json({
            msg: 'get single order',
            order: one
        })
    } catch (err) {
        console.error(err.message)
    }
})


// POST SINGLE ORDER
router.post('/', async (req, res) => {

    const { orderName, orderPrice, orderDescription, orderCategory } = req.body

    try {

        const newOrder = new orderModel({
            name: orderName,
            price: orderPrice,
            description: orderDescription,
            category: orderCategory
        })

        const createdOrder = await newOrder.save()

        res.json({
            msg: 'post order',
            order: createdOrder
        })
    } catch (err) {
        console.error(err.message)
    }
})

// PUT SINGLE ORDER
router.put('/:orderId', async (req, res) => {

    const { orderId } = req.params

    const { orderName, orderPrice, orderDescription, orderCategory } = req.body

    try {
        const userInput = {
            name : orderName,
            price: orderPrice,
            description: orderDescription,
            category: orderCategory
        }

        await orderModel.updateOne({"_id":orderId} , {"$set":userInput})

        res.json({
            msg : 'fix order',
            order: userInput
        })
    } catch (err) {
        console.error(err.message)
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