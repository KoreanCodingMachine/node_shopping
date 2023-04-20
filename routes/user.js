import express from "express";
import userModel from "../models/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {protect} from "../middleware/authMiddleware.js";
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

    // 이메일이 있어야한다. -> 패스워드 디코딩 -> return jsonwebtoken

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

        // jsonwebtoken 생성
        const token = await jwt.sign(
            {userId: user._id, email: user.email, name: user.username},
            "kimjuhyeong",
            { expiresIn: "1h" }
        )

        res.json({
            user,
            token
        })

    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
})


// 프로필정보
router.get('/', protect, async (req, res) => {
    res.json(req.user)
})


// 유저 전체 리스트 가져오기
router.get('/list', async (req, res) => {
    try {
        const users = await userModel.find()
        res.json(users)
    } catch (err) {
        res.status(500)
        throw new Error(err)
    }
})

export default router