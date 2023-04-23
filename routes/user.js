import express from "express";
import userModel from "../models/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {protect} from "../middleware/authMiddleware.js";
const router = express.Router()

// 회원가입
router.post('/register', async (req, res) => {

    // 회원가입 입력정보 받기
    const { username, email, password, bio } = req.body

    // 로직: 이메일 중복 체크 -> 패스워드 암호화

    try {

        // 이메일 중복 체크 -> 유저 모델에서 회원가입으로 입력한 이메일이 있는지 확인
        const user = await userModel.findOne({email})

        // 이메일이 중복된다면 중복됨으로 에러메시지 생성
        if (user) {
            res.status(400).json({
                msg: '이미 해당 이메일로 가입한 회원이 있습니다.'
            })
        }

        // 이메일이 중복되지 않는다면
        // 비밀번호는 암호화하여 관리해야한다. -> bcrypt 라이브러리 이용
        const hashedPassword = await bcrypt.hash(password, 10)

        // 회원가입한 유저정보 데이터베이스에 저장
        const newUser = new userModel({
            username,
            email,
            password: hashedPassword,
            bio
        })

        const createdUser = await newUser.save()

        res.json({
            msg: '회원가입 성공',
            createdUser
        })

    } catch (err) {
        res.status(500)
        throw new Error(err.message)
    }
})


// 로그인
router.post('/login', async (req, res) => {

    // 이메일이 있어야한다. -> 패스워드 디코딩 -> return jsonwebtoken

    // 클라이언트로부터 이메일 , 비밀번호를 입력받는다
    const { email, password } = req.body


    try {
        // 입력받은 이메일에 해당하는 user 정보를 조회한다.
        const user = await userModel.findOne({email})

        console.log(user)

        // user가 없다면 -> 408에러 -> 'no user'
        if (!user) {
            return res.status(408).json({
                msg: 'no user'
            })
        }

        // 클라이언트가 입력한 비밀번호와 이메일에 해당하는 유저의 비밀번호를 디코딩(bcrypt.comapre)한 후 비교하여
        // password decoding
        const isMatched = await bcrypt.compare(password, user.password)

        // 유저 디비의 비밀번호와 클라이언트가 보낸 비밀번호가 다르다면 -> 409 에러
        if (!isMatched) {
            return res.status(409).json({
                msg: 'do not match password'
            })
        }

        // 비밀번호가 같다면
        // jsonwebtoken 생성
        // jwt.sign(payload,secretOrPrivateKey,options)
        const token = await jwt.sign(
            {userId:user._id, email:user.email},
            "kimjuhyeong",
            {expiresIn: '1h'}
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
// 프로필정보를 가져오려면 로그인후에 이용해야한다. -> protect middleware 사용
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