import productModel from "../models/product.js";
import expressAsyncHandler from "express-async-handler";
import redisCli from "../config/redis.js";

// 전체 product를 페이지네이션으로 조회하게 만들어주는 api
const getAllProducts = expressAsyncHandler(async (req, res) => {
    // 1. 페이지 사이즈 와 , 키워드 , 현재 페이지를 쿼리로 받는다.
    const pageSize = req.query.size
    const page = req.query.pageNumber || 1
    const keyword = req.query.keyword
        ? {
            name:{
                $regex: req.query.keyword,
                $options: 'i'
            }
        }
        :{}

    // 현재 products 의 갯수를 구한다.
    const count = await productModel.countDocuments({...keyword})

    // 전체 페이지 수를 구한다.
    const pages = Math.ceil(count / pageSize)

    // products 개수가 없으면 204

    if (!count) {
        return res.status(204).json({
            msg: 'no product'
        })
    }

    // products 가 존재한다면 -> 페이지네이션
    // page <= pages 이면 데이터 전달 , 아니면 no-content

    if ( page > pages) {
        res.status(204).json({
            msg: 'no content',
        })
    }

    let productsFromRedis = await redisCli.get('products')

    if (productsFromRedis === null) {
        const productsFromDB = await productModel.find()
        await redisCli.set('products', JSON.stringify(productsFromDB))

        const products = await productModel
            .find({...keyword})
            .limit(pageSize)
            .skip(pageSize * (page-1))

        res.status(200).json({
            msg:'get products',
            count,
            products,
            page: (+page),
            pages
        })
    }


    // 기존의 redis와 products db 비교

    const productFromDB = await productModel.find()
    let redisData = JSON.parse(productsFromRedis)


    if (JSON.stringify(productFromDB) === JSON.stringify(redisData)) {
        return res.json({
            msg: 'get from redis',
            data: redisData
        })
    }


    redisCli.del('products')
    redisCli.set('products', JSON.stringify(productFromDB))
    productsFromRedis = await redisCli.get('products')


    res.json({
        msg:'chat',
        data: JSON.parse(productsFromRedis)
    })

})

const getAProduct = expressAsyncHandler( async (req, res) => {
        const { productId } = req.params

        const productFromRedis = await redisCli.get('products')
        console.log('!!!!!!!!!!!!!!', productFromRedis)
        // products의 내용이 없으면 -> 업데이트 -> 디비에 있는 찾고자하는 데이터를 뿌려준다.
        if (productFromRedis === null){
            const products = await productModel.find()
            await redisCli.set('products', JSON.stringify(products))
            const product = await productModel.findById(productId)

            return res.json({
                msg: 'get product',
                product
            })
        }
        // products의 내용이 있으면 -> 내가 찾고자하는 productId를 찾아서 리턴

        const jsonData = JSON.parse(productFromRedis)
        console.log("@@@@@@@@@", jsonData)
        const data = await jsonData.find(data => data._id === productId.toString())
        console.log("!!!!!!!!",typeof data)

        if (!data) {
            await redisCli.del('products')
            const products = await productModel.find()
            await redisCli.set("products", products)

            const jsonData = await JSON.parse(productFromRedis)
            console.log('!!!!!!!!!!!!!', jsonData)
            const data = await jsonData.find(data => data._id.toString() === productId.toString())


            return res.json({
                msg: 'get product',
                data
            })
        }

        res.json({
            msg: 'get product',
            data
        })


})



const postProduct = expressAsyncHandler(async (req, res) => {

        const { name, price, description, category } = req.body

        // 새로운 product 스키마를 생성하고 저장한다.
        const newProduct = new productModel({
            name,
            price,
            description,
            category
        })

        const createdProduct = await newProduct.save()
        // const productFromRedis = await redisCli.get('products')
        // if (productFromRedis) {
        //     const products = JSON.parse(productFromRedis)
        //     products.push(createdProduct)
        //     await redisCli.set('products', JSON.stringify(products))
        // } else {
        //     const products = await productModel.find()
        //     await redisCli.set('products', JSON.stringify(products))
        // }

        return res.json({
            msg: `successfully created new product`,
            product: createdProduct
        })
})

const updateProduct = expressAsyncHandler(async (req, res) => {

    // 수정할 productId 를 params 으로 받는다.
    const { productId } = req.params

    // 수정할 content를 body로 받는다.
    const { name, price, description, category } = req.body

    // 수정할 product 가 있는지를 조회한다.
    const product = await productModel.findById(productId)

    // product가 존재하지 않는다면 204
    if (!product) {
        return res.status(204).json({
            msg: 'no product'
        })
    }

    // product가 존재한다면 수정
    if (product) {
        product.name = name ? name : product.name
        product.price = price ? price : product.price
        product.description = description ? description : product.description
        product.category = category ? category : product.category
    }

    // 변경사항 저장
    await product.save()

    // 레디스 반영

    const products = await productModel.find()
    await redisCli.del('products')
    const redisProducts = await redisCli.set('products', JSON.stringify(products))
    console.log('!!!!!!!!!!!!!!!!!', redisProducts)

    console.log(redisProducts.find((data) => data._id.toString() === productId.toString() ))

    res.json({
        msg: `update product by ${productId}`
    })

})

const deleteAllProduct = expressAsyncHandler(async (req, res) => {

        await productModel.deleteMany()

        await redisCli.del('products')

        res.status(200).json({
            msg: 'delete all products'
        })

})

const deleteAProduct = expressAsyncHandler(async (req, res) => {
        const { productId } = req.params

        await productModel.findByIdAndDelete(productId)

        res.status(204).json({
            msg: `delete product by ${productId}`
        })
})

const getCategoryProduct = expressAsyncHandler( async (req, res) => {

        const pageSize = req.query.pageSize
        const page = req.query.page || 1
        const category = req.query.category
            ? {
                category : {
                    $regex: `^${req.query.category}$`,
                    $options: 'i'
                }
            } : {}

        const count = await productModel.countDocuments({...category})

        const filter = await productModel.find({...category})

        // 전체 페이지
        const pages = Math.ceil(count / pageSize)

        if (!count) {
            return res.status(204).json({
                msg: 'no matched category'
            })
        }

        const products = await productModel
            .find({...category})
            .limit(pageSize)
            .skip(pageSize * (page - 1))

        if ( page > pages ) {
            return res.status(204).json({
                msg: 'no more products, page exceed'
            })
        }

        res.status(200).json({
            msg: `get product page:${page}`,
            products,
            pages,
            count: products.length
        })
})

const createProductReview = expressAsyncHandler(async (req, res) => {
    const { rating, comment } = req.body

    console.log('???????', req.user)

    const product = await productModel.findById(req.params.id)

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        )

        if (alreadyReviewed) {
            res.status(400)
            throw new Error('Product already reviewed')
        }

        const review = {
            name: req.user.username,
            rating: Number(rating),
            comment,
            user: req.user._id
        }

        product.reviews.push(review)

        product.numReviews = product.reviews.length

        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length

        await product.save()
        res.status(201).json({
            msg: 'Review added'
        })
    }
})

export {
    getAllProducts,
    getAProduct,
    postProduct,
    updateProduct,
    deleteAllProduct,
    deleteAProduct,
    getCategoryProduct,
    createProductReview
}