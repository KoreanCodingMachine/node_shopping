import express from "express";
import orderModel from "../models/order.js";
import {protect} from "../middleware/authMiddleware.js";
const router = express.Router()

// GET ALL ORDER
router.get('/', async (req, res) => {
    try {
        const order = await orderModel
            .find()
            .populate('product', ['name', 'price'])
            .populate('user')
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
router.get('/:orderId', protect, async (req, res) => {

    // 로그인한 사람과 조회하고자 하는 오더의 유저가 같다면


    const { orderId } = req.params

    try {
        const orderInfo = await orderModel.findById(orderId)

        console.log('!!!!!!!!!!!!!!', orderInfo)

        if (req.user._id.toString() !== orderInfo.user.toString()) {
            return res.status(406).json({
                msg: '당신이 주문한 것만 조회 가능합니다.'
            })
        }

        const order = await orderModel
            .findById(orderId)
            .populate('product',['name', 'price'])
            .populate('user')
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
router.post('/', protect, async (req, res) => {

    const { product, qty, desc } = req.body

    console.log("???????????????????????????????", req.user)
    try {

        const newOrder = new orderModel({
            product, qty, desc , user: req.user._id
        })

        const createdOrder = await newOrder.save()

        res.json({
            msg: 'post order',
            order: createdOrder,
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