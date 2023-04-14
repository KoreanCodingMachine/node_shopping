import express  from 'express'
import morgan from  'morgan'
import dotEnv from 'dotenv'

dotEnv.config()
const app = express()

import productRouter from "./routes/product.js";
import orderRouter from './routes/order.js'

// middleware
// req , res 에 대한 로그를 찍어주는 라이브러리 -> morgans
app.use(morgan('dev'))





// routing
app.use('/product', productRouter)
app.use('/order', orderRouter)






const port = process.env.PORT || 9090
app.listen(port, () => {
    console.log('server started')
})
