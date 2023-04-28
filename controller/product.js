import productModel from "../models/product.js";
import expressAsyncHandler from "express-async-handler";

const getAllProducts = expressAsyncHandler(async (req, res) => {

    // 페이지 네이션
    // 1. 쿼리로 pageSize(페이지당 컨텐츠 갯수) , page(현재 페이지) , keyword 를 입력받는다.
    const pageSize = req.query.size
    const page = req.query.pageNumber || 1
    const keyword = req.query.keyword
        ? {
            name : {
                $regex: req.query.keyword,
                $options: 'i'
            }
        }
        : {}

    // 2. keyword에 맞는 products 모델을 조회한다.
    const products = await productModel.find({...keyword})

    // 3. products 데이터의 총 갯수를 구한다.
    const count = await productModel.countDocuments({...keyword})

    // 3. products 의 데이터가 없다면 -> 204 (no content)
    if (!products) {
        res.status(204).json({
            msg: 'no products'
        })
    }

    // 4. products 데이터가 있다면 페이지네이션
    if (products) {
        res.status(200).json({
            msg: 'get products',
            total:count,
            products,
            page: (+page),
            pageSize: Math.ceil(count / pageSize)

        })
    }
})

const getAProduct = expressAsyncHandler( async (req, res) => {

        const { productId } = req.params


        const product = await productModel.findById(productId)

        if (product) {
            return res.json({
                msg: 'get single product',
                product
            })
        }

        if (!product) {
           res.status(204) // no content
           throw new Error('no product')
        }
})



const postProduct = expressAsyncHandler(async (req, res) => {

        const { name, price, description, category } = req.body

        const newProduct = new productModel({
            name,
            price,
            description,
            category
        })

        const createdProduct = await newProduct.save()

        res.status(201).json({
            msg: 'post product',
            createdProduct
        })
})

const updateProduct = expressAsyncHandler(async (req, res) => {

    const { productId } = req.params

    const { name, price, description, category } = req.body

    const product = await productModel.findById(productId)

    // product가 있을 때
    // 입력 req.body에 담겨저오는 수정 값이 있다면 req.body 값으로 수정
    // 없다면 기존 product 값으로 수정

    if (product) {
        product.name = name ? name : product.name
        product.price = price ? price : product.price
        product.description = description ? description : product.description
        product.category = category ? category : product.category

        await product.save()

        return res.status(201).json({
            msg: `product updated by ${productId}`
        })
    }

})

const deleteAllProduct = expressAsyncHandler(async (req, res) => {

        await productModel.deleteMany()

        res.json({
            msg : 'deleted all products'
        })
})

const deleteAProduct = expressAsyncHandler(async (req, res) => {
        const { productId } = req.params

        await productModel.findByIdAndDelete(productId)
        res.json({
            msg:`deleted product at ${productId}`
        })

})

const getCategoryProduct = expressAsyncHandler( async (req, res) => {

        const pageSize = req.query.size

        const page = req.query.page || 1


        const category = req.query.category
                ? {
                    category: {
                        $regex: req.query.category,
                        $options: 'i'
                    }
                }
                : {}

        const categoryProduct = await productModel
            .find({...category})
            .limit(pageSize)
            .skip(pageSize * (page-1))

        const count = await productModel.countDocuments({...category})

        const pages = Math.ceil(count / pageSize )

        if ((Array.isArray(categoryProduct)) && (!count)) {
            res.status(204).json({
                msg: 'no category product'
            })

        }

        if ((Array.isArray(categoryProduct)) && count) {
            res.status(200).json ({
                msg: 'get category',
                count,
                categoryProduct,
                page:(+page),
                pages
            })
        }

})


export { getAllProducts, getAProduct, postProduct, updateProduct, deleteAllProduct, deleteAProduct, getCategoryProduct }