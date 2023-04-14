import express  from 'express'
import morgan from  'morgan'
import dotEnv from 'dotenv'

dotEnv.config()
const app = express()


// middleware
// req , res 에 대한 로그를 찍어주는 라이브러리 -> morgans
app.use(morgan('dev'))





const port = process.env.PORT || 9090
app.listen(port, () => {
    console.log('server started')
})
