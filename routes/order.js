import express from "express";
import orderModel from "../models/order.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router()

// GET ALL ORDER
router.get('/', async (req, res) => {
    try {
        const orders = await orderModel
            .find()
            .populate('product')
            .populate('user',['username'])

        const count = orders.length

        if(!orders) {
            return res.json({
                msg:'등록된 메시지가 없습니다.'
            })
        }

        res.json({
            msg: 'get all orders',
            count,
            orders
        })

    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
})


// GET SINGLE ORDER
// 해당 유저의 장바구니를 조회하려면 당연히 로그인이 되어있어야한다.
router.get('/:orderId', protect, async (req, res) => {

    const { orderId } = req.params

    try {
        // orderId에 해당하는 order를 가져온다.
        const orderInfo = await orderModel.findById(orderId)

        // 로그인한 사람과 장바구니를 등록한 유저의 아이디가 다르다면
        if (req.user._id.toString() !== orderInfo.user.toString()) {
            return res.status(406).json({
                msg: '당신이 주문한것만 조회 가능합니다.'
            })
        }
        // 로그인한 사람과 장바구니를 등록한 유저의 아이디가 같다면
        const order = await orderModel.findById(orderId)
            .populate('product')
            .populate('user',['username'])

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
// 해당 유저의 장바구니 품목에 등록하려면 역시 로그인이 필요하다
router.post('/', protect, async (req, res) => {

    // 장바구니에 등록할 품목 , 수량 , 설명을 클라이언트로부터 입력받는다.
    const { product, qty, desc } = req.body

    // 미들웨어로 부터 로그인한 유저 확인
    console.log('????????????????????????', req.user)

    try {
        // 새로운 order document 생성
        const newOrder = new orderModel({
            product,
            user: req.user._id,
            qty,
            desc
        })

        const createdOrder = await newOrder.save()

        res.json({
            msg: 'create new order',
            createdOrder
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