import express  from 'express'
import morgan from  'morgan'
import dotEnv from 'dotenv'
import bodyParser from "body-parser";
import cors from 'cors'
import passport from "passport"



dotEnv.config()
const app = express()

import passportConfig from "./config/passport.js";
import connectDatabase from "./config/database.js";
import productRouter from "./routes/product.js";
import orderRouter from './routes/order.js'
import userRouter from './routes/user.js'
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";




// connect database
connectDatabase()

// middleware ( req -> middleware -> res)
// req , res 에 대한 로그를 찍어주는 라이브러리 -> morgans
app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : false})) // body parser 인식

// passport config
passportConfig(passport)

// routing
app.use('/product', productRouter)
app.use('/order', orderRouter)
app.use('/user', userRouter)

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 9090
app.listen(port, () => {
    console.log(`server started ${port}`)
})
