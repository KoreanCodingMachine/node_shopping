import userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import {emailConfirmTemplate, sendEmail} from "../config/sendEmail.js";

const userRegister = async (req, res) => {

    const { username, email, password, bio } = req.body

    try {
        // 이메일 중복체크를 한다.
        const user = await userModel.findOne({email})

        if (user) {
            res.status(400).json({
                msg: '이미 가입한 회원이 있습니다.'
            })
        }
        // // 비밀번호를 암호화 한다.
        // const hashedPassword = await bcrypt.hash(password,10)

        // db document 생성
        const newUser = new userModel({
            username,
            email,
            password,
            bio
        })

        // 유저 생성
        const createdUser = await newUser.save()

        // 이메일 확인용 토큰
        const emailConfirmToken = await jwt.sign(
            {email: createdUser.email},
            process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY,
            {expiresIn: '10m'}
        )

        // 이메일 전송
        await sendEmail(createdUser.email, '이메일 확인', emailConfirmTemplate(emailConfirmToken))

        res.json({
            msg: 'success create user',
            createdUser
        })

    } catch (err) {
        res.status(500).json({
            msg: err.message
        })

    }
}

const loggedUser = async (req, res) => {
    const { email, password } = req.body

    const user = await userModel.findOne({email})

    if (user && (await user.matchPassword(password)) ) {
        // 비밀번호가 일치한다면 토큰 발급
        const token = await jwt.sign(
            {userId:user._id, email:user.email},
            process.env.JWT_ACCESSTOKEN_SECRET_KEY,
            {expiresIn: '1h'}
        )

        res.json({
            user,
            token
        })
    } else {
       res.status(500).json({
           msg: 'invalid email and password'
       })
    }
    // try {
    //     // 이메일 정보 조회
    //     const user = await userModel.findOne({email})
    //
    //     // 가입되지 않은 이메일 -> 에러
    //     if (!user) {
    //         return res.status(408).json({
    //             msg: 'not authorized user'
    //         })
    //     }
    //
    //     // 가입되어있다면 비밀번호 디코딩후 비밀번호 일치여부 확인
    //     // const isMatched = await bcrypt.compare(password, user.password)
    //
    //     const isMatched = await user.matchPassword(password)
    //
    //     if (!isMatched) {
    //         return res.status(409).json({
    //             msg: 'password do not match'
    //         })
    //     }
    //
    //     // 비밀번호가 일치한다면 토큰 발급
    //     const token = await jwt.sign(
    //         {userId:user._id, email:user.email},
    //         process.env.JWT_ACCESSTOKEN_SECRET_KEY,
    //         {expiresIn: '1h'}
    //     )
    //
    //     res.json({
    //         user,
    //         token
    //     })

    // } catch (err) {
    //     res.status(500)
    //     throw new Error(err.message)
    // }

}

const getProfile = async (req, res) => {
    res.json(req.user)
}

const getAllUserList = async (req, res) => {
    try {
        const users = await userModel.find()
        res.json(users)
    } catch (err) {
        res.status(500)
        throw new Error(err)
    }
}


export { userRegister, loggedUser, getProfile, getAllUserList }