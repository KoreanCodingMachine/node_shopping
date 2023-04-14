import express  from 'express'
const app = express()


//requset response test
app.get("/", (req, res) => {
    res.json({
        msg: 'get data'
    })
})





const port = 8080
app.listen(port, () => {
    console.log('server started')
})
