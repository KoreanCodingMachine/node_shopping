import userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import {emailConfirmTemplate, passwordConfirmTemplate, sendEmail} from "../config/sendEmail.js";
import expressAsyncHandler from "express-async-handler";

const userRegister =  expressAsyncHandler( async (req, res) => {

        const { username, email, password, bio, phone, role } = req.body

        // 이메일 중복체크를 한다.
        const user = await userModel.findOne({email})

        if (user) {
            res.status(409) // 서버의 요청 상태와 충돌
            throw new Error('이미 가입한 회원이 있습니다.')
        }

        // // 비밀번호를 암호화 한다.
        // const hashedPassword = await bcrypt.hash(password,10)

        // db document 생성
        const newUser = new userModel({
            username,
            email,
            password,
            bio,
            phone,
            role
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

        res.status(201).json({
            msg: 'success create user',
            createdUser
        })

})

const emailConfirm =  expressAsyncHandler(async (req, res) => {

        const token = req.body.token

        const {email} = await jwt.verify(token, process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY)

        const user = await userModel.findOne({email})

        if (user.isEmail === true) {
            res.status(409) // conflict
            throw new Error('already isEmail true')
        }

        user.isEmail = true
        await user.save()

        res.status(201).json({
            msg: 'successful change isEmail'
        })

})

const findPassword = expressAsyncHandler( async (req, res) => {

        const {email} = req.body

        const user = await userModel.findOne({email})

        const findPasswordToken = await jwt.sign(
            {id: user._id},
            process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY,
            {expiresIn: '10m'}
        )

        await sendEmail(user.email, '이메일 확인', passwordConfirmTemplate(findPasswordToken))

        res.status(201).json({
            msg: 'please check your email'
        })
})

const findEmail = expressAsyncHandler( async (req, res) => {

        const { phone } = req.body


        const user = await userModel.findOne({phone})

        if (!user) {
            res.status(404)
            throw new Error('no user')
        }

        res.status(200).json({
            msg: 'successful find email',
            email: user.email
        })

})

const updatePasswordBeforeLogin = expressAsyncHandler( async (req, res) => {

        const { token, newPassword } = req.body

        const { id } = await jwt.verify(token, process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY)

        const user = await userModel.findById(id)

        user.password = newPassword

        await user.save()

        res.status(201).json({
            msg: 'updated password'
        })

})

const loggedUser =  expressAsyncHandler( async (req, res) => {
    const { email, password } = req.body

    const user = await userModel.findOne({email})

    if (user && (await user.matchPassword(password)) ) {
        // 비밀번호가 일치한다면 토큰 발급
        const token = await jwt.sign(
            {userId:user._id, email:user.email},
            process.env.JWT_ACCESSTOKEN_SECRET_KEY,
            {expiresIn: '1h'}
        )

        res.status(201).json({
            user,
            token
        })
    } else {
       res.status(409) // conflict
       throw new Error('invalid email and password')
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

})

const getProfile = expressAsyncHandler(async (req, res) => {
        res.status(200).json(req.user)
})

const getAllUserList = expressAsyncHandler( async (req, res) => {
        const users = await userModel.find()
        res.status(200).json(users)
})


export { userRegister, loggedUser, getProfile, getAllUserList, emailConfirm, findPassword, updatePasswordBeforeLogin, findEmail }