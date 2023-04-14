import express from "express";

const router = express.Router()

// get order
router.get('/', async (req, res) => {
    try {
        res.json({
            msg:'get order'
        })
    } catch (err) {

    }
})

// post order

router.post('/', async (req, res) => {
    try {
        res.json({
            msg: 'post order'
        })
    } catch (err) {

    }
})

// fix order
router.put('/', async (req, res) => {
    try {
        res.json({
            msg : 'fix order'
        })
    } catch (err) {

    }
})

// delete order

router.delete('/', async (req, res) => {
    try {
        res.json({
            msg : 'delete '
        })
    } catch (err) {

    }
})

export default router