import productModel from "../models/product.js";

const getAllProducts = async (req, res) => {
    try {
        const pageSize = 10
        const page = Number(req.query.pageNumber) || 1



        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i'
                }
            }
            : {}

        const count = await productModel.countDocuments({...keyword})
        const products = await productModel
            .find({...keyword})
            .limit(pageSize)
            .skip(pageSize * (page - 1))


        if (products) {
            return res.json({
                msg: 'get all producdts',
                products,
                page,
                pages: Math.ceil(count / pageSize)
            })
        }

        res.status(404)
        throw new Error('no products')
    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
}

const getAProduct = async (req, res) => {

    const { productId } = req.params

    try {
        const product = await productModel.findById(productId)

        if (product) {
            return res.json({
                msg: 'get single product',
                product
            })
        }

        res.status(404)
        throw new Error('no product')
    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }

}



const postProduct = async (req, res) => {

    const { name, price, description, category } = req.body

    try {
        const newProduct = new productModel({
            name,
            price,
            description,
            category
        })

        const createdProduct = await newProduct.save()

        res.json({
            msg: 'post product',
            createdProduct
        })

    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
}

const updateProduct = async (req, res) => {

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

        return res.json({
            msg: `product updated by ${productId}`
        })
    }

    res.status(500)
    throw new Error('no matched product')

}

const deleteAllProduct = async (req, res) => {
    try {
        await productModel.deleteMany()
        res.json({
            msg : 'deleted all products'
        })
    } catch (err) {
        console.error(err.message)
    }
}

const deleteAProduct = async (req, res) => {
    const { productId } = req.params

    try {
        await productModel.findByIdAndDelete(productId)
        res.json({
            msg:`deleted product at ${productId}`
        })
    } catch (err) {

    }
}


export { getAllProducts, getAProduct, postProduct, updateProduct, deleteAllProduct, deleteAProduct }