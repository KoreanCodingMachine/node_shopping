import express from "express";

import {
    getAllProducts,
    getAProduct,
    postProduct,
    updateProduct,
    deleteAllProduct,
    deleteAProduct,
    getCategoryProduct,
    createProductReview
} from "../controller/product.js";

import {isAdmin, protect} from "../middleware/authMiddleware.js";
import passport from "passport";

const checkAuth = passport.authenticate('jwt', { session: false })
const router = express.Router()

// CRUD


// 전체 Product 불러오기
router.get('/', getAllProducts)

// product 카테고리별로 불러오기
router.get('/category', getCategoryProduct)

// 상세 Product를 가져오기
router.get('/:productId', getAProduct)

// product 등록하기
router.post('/', protect, isAdmin, postProduct)

// product 수정하기
router.put('/:productId', protect, isAdmin, updateProduct)

// 상세 product 삭제하기
router.delete('/:productId',protect, isAdmin, deleteAProduct)

// 전체 product 삭제하기
router.delete('/',protect, isAdmin, deleteAllProduct)

// 리뷰 등록하기
// @desc Create new review(product)
// @route POST /products/:id/reviews
// @access Private
router.post('/:id/review', checkAuth, createProductReview)





export default router