import productModel from "../models/product.js";
import expressAsyncHandler from "express-async-handler";
import redisCli from "../config/redis.js";

// 전체 product를 페이지네이션으로 조회하게 만들어주는 api
const getAllProducts = expressAsyncHandler(async (req, res) => {

    // // 페이지 네이션
    // // 1. 쿼리로 pageSize(페이지당 컨텐츠 갯수) , page(현재 페이지) , keyword 를 입력받는다.
    // const pageSize = req.query.size
    // const page = req.query.pageNumber || 1
    // const keyword = req.query.keyword
    //     ? {
    //         name : {
    //             $regex: req.query.keyword,
    //             $options: 'i'
    //         }
    //     }
    //     : {}
    //
    // // 2. keyword에 맞는 products 모델을 조회한다.
    // const products = await productModel.find({...keyword})
    //
    // // 3. products 데이터의 총 갯수를 구한다.
    // const count = await productModel.countDocuments({...keyword})
    //
    // // 3. products 의 데이터가 없다면 -> 204 (no content)
    // if (!products) {
    //     res.status(204).json({
    //         msg: 'no products'
    //     })
    // }
    //
    // // 4. products 데이터가 있다면 페이지네이션
    // if (products) {
    //     res.status(200).json({
    //         msg: 'get products',
    //         total:count,
    //         products,
    //         page: (+page),
    //         pageSize: Math.ceil(count / pageSize)
    //
    //     })
    // }

    // 페이지네이션

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

    const productsFromRedis = await redisCli.get('products')

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

    // const products = await productModel
    //     .find({...keyword})
    //     .limit(pageSize)
    //     .skip(pageSize * (page-1))

    // res.status(200).json({
    //     msg:'get products',
    //     count,
    //     products,
    //     page: (+page),
    //     pages
    // })

      // const jsonData = JSON.parse(productsFromRedis)

      // const products = jsonData
      //     .find({...keyword})
      //     .limit(pageSize)
      //     .skip(pageSize * (page - 1))
      //
      // console.log(products)
     res.json(JSON.parse(productsFromRedis))

})

const getAProduct = expressAsyncHandler( async (req, res) => {

        // const { productId } = req.params
        //
        //
        // const product = await productModel.findById(productId)
        //
        // if (product) {
        //     return res.json({
        //         msg: 'get single product',
        //         product
        //     })
        // }
        //
        // if (!product) {
        //    res.status(204) // no content
        //    throw new Error('no product')
        // }

        //

        // // param 으로 productId 를 받음
        const { productId } = req.params
        //
        // // prodcutId 로 product 조회
        // const product = await productModel.findById(productId)
        //
        // // product가 없다면 , 204
        // if (!product) {
        //     res.status(204).json({
        //         msg: 'no product'
        //     })
        // }
        //
        // // product가 존재한다면 전달
        // res.status(200).json({
        //     msg: 'get product',
        //     product
        // })

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

        // const { name, price, description, category } = req.body
        //
        // const newProduct = new productModel({
        //     name,
        //     price,
        //     description,
        //     category
        // })
        //
        // const createdProduct = await newProduct.save()
        //
        // res.status(201).json({
        //     msg: 'post product',
        //     createdProduct
        // })

        // product를 등록하려면 login , admin 미들웨어를 통과해야한다.

        // product 정보를 body로 입력받는다.
        const { name, price, description, category } = req.body

        // 새로운 product 스키마를 생성하고 저장한다.
        const newProduct = new productModel({
            name,
            price,
            description,
            category
        })

        const createdProduct = await newProduct.save()
        const productFromRedis = await redisCli.get('products')
        if (productFromRedis) {
            const products = JSON.parse(productFromRedis)
            products.push(createdProduct)
            await redisCli.set('products', JSON.stringify(products))
        } else {
            const products = await productModel.find()
            await redisCli.set('products', JSON.stringify(products))
        }

        return res.json({
            msg: `successfully created new product`,
            product: createdProduct
        })
})

const updateProduct = expressAsyncHandler(async (req, res) => {

    // const { productId } = req.params
    //
    // const { name, price, description, category } = req.body
    //
    // const product = await productModel.findById(productId)
    //
    // // product가 있을 때
    // // 입력 req.body에 담겨저오는 수정 값이 있다면 req.body 값으로 수정
    // // 없다면 기존 product 값으로 수정
    //
    // if (product) {
    //     product.name = name ? name : product.name
    //     product.price = price ? price : product.price
    //     product.description = description ? description : product.description
    //     product.category = category ? category : product.category
    //
    //     await product.save()
    //
    //     return res.status(201).json({
    //         msg: `product updated by ${productId}`
    //     })
    // }

    // product를 수정하려면 auth, admin 미들웨어를 통과해야한다.




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

        // await productModel.deleteMany()
        //
        // res.json({
        //     msg : 'deleted all products'
        // })

        // 상품을 전체삭제하는 권한 역시 로그인 , admin 권한이 있어야 삭제할 수 있다.

        // mongoose 의 deleteMany() method를 이용

        await productModel.deleteMany()

        await redisCli.del('products')

        res.status(200).json({
            msg: 'delete all products'
        })

})

const deleteAProduct = expressAsyncHandler(async (req, res) => {
        // const { productId } = req.params
        //
        // await productModel.findByIdAndDelete(productId)
        // res.json({
        //     msg:`deleted product at ${productId}`
        // })

        const { productId } = req.params

        await productModel.findByIdAndDelete(productId)

        res.status(204).json({
            msg: `delete product by ${productId}`
        })
})

const getCategoryProduct = expressAsyncHandler( async (req, res) => {

        // const pageSize = req.query.size
        //
        // const page = req.query.page || 1
        //
        //
        // const category = req.query.category
        //         ? {
        //             category: {
        //                 $regex: req.query.category,
        //                 $options: 'i'
        //             }
        //         }
        //         : {}
        //
        // const categoryProduct = await productModel
        //     .find({...category})
        //     .limit(pageSize)
        //     .skip(pageSize * (page-1))
        //
        // const count = await productModel.countDocuments({...category})
        //
        // const pages = Math.ceil(count / pageSize )
        //
        // if ((Array.isArray(categoryProduct)) && (!count)) {
        //     res.status(204).json({
        //         msg: 'no category product'
        //     })
        //
        // }
        //
        // if ((Array.isArray(categoryProduct)) && count) {
        //     res.status(200).json ({
        //         msg: 'get category',
        //         count,
        //         categoryProduct,
        //         page:(+page),
        //         pages
        //     })
        // }

        // product를 카테고리별로 구분하고 / 페이젠이션을 구현한 api

        // query 로 pageSize , page , category 를 받는다.

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


export { getAllProducts, getAProduct, postProduct, updateProduct, deleteAllProduct, deleteAProduct, getCategoryProduct }