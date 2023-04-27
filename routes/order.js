import express from "express";
import {isAdmin, protect} from "../middleware/authMiddleware.js";
import {createOrder, deleteAllOrder, deleteAOrder, getAllOrder, getAOrder, updateOrder} from "../controller/order.js";
const router = express.Router()

// GET ALL ORDER
router.get('/', protect, isAdmin, getAllOrder)


// GET SINGLE ORDER
// 해당 유저의 상세 장바구니를 조회하려면 당연히 로그인이 되어있어야한다.
router.get('/:orderId', protect, getAOrder)


// POST SINGLE ORDER
// 장바구니 품목에 등록하려면 로그인이 필요하다
// 로그인 정보는 protect 미들웨어에서 받아온다
router.post('/', protect, createOrder)


// PUT SINGLE ORDER
// 내가 등록한것만 수정할 수 있는 권한
router.put('/:orderId',protect ,updateOrder)

// DELETE ALL ORDER
//
router.delete('/',protect, isAdmin, deleteAllOrder)

// DELETE SINGLE ORDER
// 내가 등록한것만 삭제
router.delete('/:orderId', deleteAOrder)


export default router