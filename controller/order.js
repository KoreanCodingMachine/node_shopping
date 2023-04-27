import orderModel from "../models/order.js";

const getAllOrder = async (req, res) => {
    try {
        const orders = await orderModel
            .find()
            .populate('product')
            .populate('user')
        console.log(orders)

        if (orders) {
            return res.json({
                msg: 'get all orders',
                orders
            })
        }

        res.status(408).json({
            msg: 'no order'
        })

    } catch (err) {
        res.status(500).json({
            msg: err.message
        })

    }

}

const getAOrder = async (req, res) => {

    const { orderId } = req.params

    try {
        const orderInfo = await orderModel.findById(orderId)

        console.log(orderInfo.user._id)
        console.log(req.user)

        // 로그인한 유저의 정보와 , 상품을 주문한 유저의 정보가 같다면 조회, 아니면 에러
        if (orderInfo.user._id.toString() !== req.user._id.toString()) {
            res.status(406).json({
                msg: '상품을 등록한 유저만 조회할 수 있습니다.'
            })
        }

        const order = await orderModel
            .findById(orderId)
            .populate('product')
            .populate('user')

        res.json({
            msg: `get order by ${orderId}`,
            order
        })
    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
}

const createOrder = async (req, res) => {

    const { product, qty, desc } = req.body

    try {
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

    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }

}


const updateOrder = async (req, res) => {

    const { product, qty, desc } = req.body

    const { orderId } = req.params

    console.log(req.user)

    try {
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

        res.status(404).json({
            msg: '당신이 등록한 장바구니만 수정 가능합니다.'
        })


    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }

}

const deleteAllOrder = async (req, res) => {
    try {
        await orderModel.deleteMany()
        res.json({
            msg : 'delete all order'
        })
    } catch (err) {

    }
}

const deleteAOrder = async (req, res) => {

    const { orderId } = req.params

    try {
        const orderInfo = await orderModel.findById(orderId)

        if (req.user._id.toString() === orderInfo.user.toString()){
            await orderModel.findByIdAndDelete(orderId)

            return res.json({
                msg: `delete order by ${orderId}`
            })
        }

        res.status(401).json({
            msg: 'delete not authorized'
        })
    } catch (err) {
        console.error(err.message)
    }
}

export { getAllOrder, getAOrder, createOrder, updateOrder, deleteAllOrder, deleteAOrder}