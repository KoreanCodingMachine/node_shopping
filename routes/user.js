import express from "express";
import userModel from "../models/user.js";
import bcrypt from 'bcrypt'
const router = express.Router()

// 회원가입
router.post('/register', async (req, res) => {

    const { username, email, password, bio } = req.body

    // 이메일 중복 체크 -> 패스워드 암호화

    try {

        const user = await userModel.findOne({ email })

        if (user) {
            res.status(404).json({
                msg: 'already signed email'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)



        const newUser = new userModel({
            username,
            email,
            password: hashedPassword,
            bio
        })

        await newUser.save()

        res.json({
            msg: '회원가입 성공',
            newUser
        })

    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
})


// 로그인
router.post('/login', async (req, res) => {

    // 이메일이 있어야한다. -> 패스워드 디코딩

    const { email, password } = req.body


    try {
        const user = await userModel.findOne({email})

        if (!user) {
            return res.status(408).json({
                msg: 'no user'
            })
        }

        // password decoding
        const isMatched = await bcrypt.compare(password, user.password)

        if (!isMatched) {
            return res.status(409).json({
                msg: 'password do not match'
            })
        }

        res.json(user)

    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
})


// 프로필정보


export default router