import express from "express";

const router = express.Router()

// CRUD


// Product 불러오기
router.get('/', async (req, res) => {
    try {
        res.json({
            msg: 'get product'
        })
    } catch (err) {

    }
})

// product 등록하기

router.post('/', async (req, res) => {
    try {
        res.json({
            msg: 'post product'
        })
    } catch (err) {

    }
})

// product 수정하기
router.put('/', async (req, res) => {
    try {
        res.json({
            msg: 'update product'
        })
    } catch (err) {

    }
})

// product 삭제하기

router.delete('/', async (req, res) => {
    try {
        res.json({
            msg:'delete product'
        })
    } catch (err) {

    }
})



export default router