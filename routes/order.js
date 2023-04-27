import express from "express";
import {isAdmin, protect} from "../middleware/authMiddleware.js";
import {createOrder, deleteAllOrder, deleteAOrder, getAllOrder, getAOrder, updateOrder} from "../controller/order.js";
const router = express.Router()

// GET ALL ORDER
// 로그인 후에, admin 유저이면 전제 장바구니 조회를 가능하게 한다.
router.get('/', protect, isAdmin, getAllOrder)


// GET SINGLE ORDER
// 해당 유저의 상세 장바구니를 조회하려면 당연히 로그인이 되어있어야한다.
router.get('/:orderId', protect, getAOrder)


// POST SINGLE ORDER
// 장바구니 품목에 등록하려면 로그인이 필요하다
router.post('/', protect, createOrder)


// PUT SINGLE ORDER
// 내가 등록한것만 수정할 수 있는 권한
router.put('/:orderId',protect, updateOrder)

// DELETE ALL ORDER
// 로그인되어있고 , addmin권한이라면 장바구니를 전체 삭제 할 수 있는 권한을 준다.
router.delete('/',protect, isAdmin, deleteAllOrder)

// DELETE SINGLE ORDER
// 내가 등록한것만 삭제 할 수있도록 권한
router.delete('/:orderId',protect, deleteAOrder)


export default router