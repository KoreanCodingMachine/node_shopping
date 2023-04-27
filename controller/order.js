import orderModel from "../models/order.js";
import expressAsyncHandler from "express-async-handler";

const getAllOrder = expressAsyncHandler( async (req, res) => {

        const orders = await orderModel
            .find()
            .populate('product')
            .populate('user')


        if (orders) {
            return res.status(200).json({
                msg: 'get all orders',
                orders
            })
        }

       if (!orders) {
           res.status(204)
           throw new Error('no order')
       }

})

const getAOrder = expressAsyncHandler( async (req, res) => {

        const { orderId } = req.params

        const orderInfo = await orderModel.findById(orderId)

        // 로그인한 유저의 정보와 , 상품을 주문한 유저의 정보가 같다면 조회, 아니면 에러
        if (orderInfo.user._id.toString() !== req.user._id.toString()) {
            res.status(403) // forbidden
            throw new Error('상품을 등록한 유저만 조회할 수 있습니다.')
        }

        const order = await orderModel
            .findById(orderId)
            .populate('product')
            .populate('user')

        res.json({
            msg: `get order by ${orderId}`,
            order
        })

})

const createOrder = expressAsyncHandler( async (req, res) => {

        const { product, qty, desc } = req.body

        const newOrder = new orderModel({
            product,
            qty,
            desc,
            user:req.user._id
        })

        const createdOrder = await newOrder.save()

        res.json({
            msg: 'createdOrder',
            createdOrder
        })

})


const updateOrder = expressAsyncHandler( async (req, res) => {

        const { product, qty, desc } = req.body

        const { orderId } = req.params

        const orderInfo = await orderModel.findById(orderId)

        if ( orderInfo && (req.user._id.toString() === orderInfo.user.toString())) {
            orderInfo.product = product ? product : orderInfo.product
            orderInfo.qty = qty ? qty : orderInfo.qty
            orderInfo.desc = desc ? desc : orderInfo.desc

            const updatedOrder = await orderInfo.save()

            return res.json({
                msg: `updated order by ${orderId}`,
                updatedOrder
            })
        }

        res.status(403) // forbidden
        throw new Error('당신이 등록한 장바구니만 수정 가능합니다.')
})

const deleteAllOrder = expressAsyncHandler( async (req, res) => {

        await orderModel.deleteMany()
        res.status(200).json({
            msg : 'delete all order'
        })

})

const deleteAOrder = expressAsyncHandler( async (req, res) => {

        const { orderId } = req.params

        const orderInfo = await orderModel.findById(orderId)

        if (req.user._id.toString() === orderInfo.user.toString()){
            await orderModel.findByIdAndDelete(orderId)

            return res.status(200).json({
                msg: `delete order by ${orderId}`
            })
        }

        res.status(401)
        throw new Error('delete not authorized')
})

export { getAllOrder, getAOrder, createOrder, updateOrder, deleteAllOrder, deleteAOrder}