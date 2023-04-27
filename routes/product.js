import express from "express";

import {
    getAllProducts,
    getAProduct,
    postProduct,
    updateProduct,
    deleteAllProduct,
    deleteAProduct,
    getCategoryProduct
} from "../controller/product.js";

const router = express.Router()

// CRUD


// 전체 Product 불러오기
router.get('/', getAllProducts)

// product 카테고리별로 불러오기
router.get('/category', getCategoryProduct)

// 상세 Product를 가져오기
router.get('/:productId', getAProduct)

// product 등록하기
router.post('/', postProduct)

// product 수정하기
router.put('/:productId', updateProduct)

// 상세 product 삭제하기
router.delete('/:productId', deleteAProduct)

// 전체 product 삭제하기
router.delete('/', deleteAllProduct)







export default router