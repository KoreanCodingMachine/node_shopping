import express  from 'express'
import morgan from  'morgan'
import dotEnv from 'dotenv'
import bodyParser from "body-parser";
import cors from 'cors'

dotEnv.config()
const app = express()

import connectDatabase from "./config/database.js";
import productRouter from "./routes/product.js";
import orderRouter from './routes/order.js'


// connect database
connectDatabase()

// middleware
// req , res 에 대한 로그를 찍어주는 라이브러리 -> morgans
app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : false})) // body parser 인식


// routing
app.use('/product', productRouter)
app.use('/order', orderRouter)


const port = process.env.PORT || 9090
app.listen(port, () => {
    console.log(`server started ${port}`)
})
