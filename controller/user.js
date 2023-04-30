import userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import {emailConfirmTemplate, passwordConfirmTemplate, sendEmail} from "../config/sendEmail.js";
import expressAsyncHandler from "express-async-handler";
import redisCli from "../config/redis.js";

// 유저 회원가입시 이메일 인증
const userRegister =  expressAsyncHandler( async (req, res) => {

        const { username, email, password, bio, phone, role } = req.body

        // 이메일 중복체크를 한다.
        const user = await userModel.findOne({email})

        if (user) {
            res.status(409) // 서버의 요청 상태와 충돌
            throw new Error('이미 가입한 회원이 있습니다.')
        }

        // 비밀번호를 암호화는 db에 비밀번호가 저장되기 전에 해쉬함수를 생성하여 자동 저장됨

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

// 이메일 인증 확인하는 api
const emailConfirm =  expressAsyncHandler(async (req, res) => {
        // 이메일 인증 확인하는 절차

        // 1.헤더로 받은 이메일 토큰을 받는다.
        const token = req.headers.authorization.split(' ')[1]
        // 2. 토큰을 디코딩한다.
        const { email } = await jwt.verify(token, process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY)
        // 3. 디코딩한 정보 (email)로 유저 정보를 조회한다.
        const user = await userModel.findOne({email})
        // 4. 유저가 존재하지 않는다면 -> 409 에러
        if (!user) {
            return res.status(409).json({
                msg: 'no user'
            })
        }
        // 4. 유저가 존자할때 isEmail 이 true이면 (이미 인증된 유저이면) 409
        if (user.isEmail){
            return res.status(409).json({
                msg: 'already authenticated user'
            })
        }
        // 5. isEmail이 기본값 (false)이면 isEmail -> true , 저장
        if (!user.isEmail) {
            user.isEmail = true
            await user.save()
        }
        // res
        res.json({
            msg: `success ${user.email} confirm`
        })

})

// 비밀번호 찾기 api
// 유저 이메일 입력 -> 이메일 인증메일 발송
const findPassword = expressAsyncHandler( async (req, res) => {

        // 유저 비밀번호 찾기
        // 1. body로 이메일 입력받기
        const { email } = req.body
        // 2. 이메일에 해당하는 유저가 있는지 조회
        const user = await userModel.findOne({email})

        if (!user) {
            res.status(409).json({
                msg: 'no user'
            })
        }
        // 3. 비밀번호 찾기용 이메일 토큰 발급
        const findPasswordEmailToken = await jwt.sign(
            {userId:user._id},
            process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY,
            {expiresIn: '10m'}
        )
        // 4. 이메일 인증 요청
        await sendEmail(user.email, '비밀번호 확인용 이메일 인증', passwordConfirmTemplate(findPasswordEmailToken))

        res.status(201).json({
            msg: '이메일을 확인해 주세요'
        })
})

// 이메일 찾기(핸드폰 인증으로) api
// 핸드포 번호 입력 -> 유저 스키마에서 핸드폰번호 조회 , 해당 유저의 이메일 알려줌
const findEmail = expressAsyncHandler( async (req, res) => {

        const { phone } = req.body

        const user = await userModel.findOne({phone})

        // 핸드폰 번호와 일치하는 유저가 없다면
        if (!user) {
            return res.status(204).json({
                msg: 'no matched phone'
            })
        }

        res.json({
            msg: '핸드폰 인증 완료',
            email: user.email
        })
})

// 로그인전 비밀번호 업데이트 api
// 비밀번호 찾기 시 발송한 이메일에 링크로 접속하면
// 토큰와 , 새로운 비밀번호를 받아 새로운 비밀번호로 대체 해주는 api
const updatePasswordBeforeLogin = expressAsyncHandler( async (req, res) => {

    // 로그인 전 비밀번호 찾기

    // header 로 token 을 전달받고 , body 로 새로운 비밀번호를 입력받음
    const token = req.headers.authorization.split(' ')[1]
    const { newPassword } = req.body

    // 토큰 디코딩
    const { userId } = await jwt.verify(token, process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY)

    // userId 로 유저 정보 조회
    const user = await userModel.findOne({_id:userId})

    if (!user) {
        return res.status(409).json({
            msg: 'no user'
        })
    }

    user.password = newPassword
    await user.save()

    res.json({
        msg: 'user change password success'
    })

})

// 로그인 후 비밀번호 변경
const updatePasswordAfterLogin = expressAsyncHandler(async (req, res) => {

        const { newPassword } = req.body

        // 로그인 후 임으로 이메일 인증은 생략하고 유저 정보만 조회함
        const user = await userModel.findById(req.user._id)

        // user 정보가 없다면, 409  error
        if (!user) {
            res.status(409)
            throw new Error('no user')
        }

        // user 정보가 있다면 기존의 비밀번호를 새로운 비밀번호를 전달받어서 유저 데이터베이스에서 검증한다.
        user.password = newPassword
        await user.save()

        res.status(205).json({
            msg: `update password by ${user.email}`
        })
})

const loggedUser =  expressAsyncHandler( async (req, res) => {
    // 유저 로그인 , 비밀번호 검증은 디비에서

    const { email , password } = req.body


    // 1.입력된 이메일에 해당하는 유저를 조회한다.
    const user = await userModel.findOne({email})

    if (!user) {
        res.status(409)
        throw new Error('no user')
    }

    // 이메일에 해당하는 유저가 존재하고 , 비밀번호가 일치한다면
    if (user && (await user.matchPassword(password, user.password))){
        // 토큰 발급
        const token = await jwt.sign(
            {userId:user._id, email:user.email},
            process.env.JWT_ACCESSTOKEN_SECRET_KEY,
            {expiresIn: '10m'}
        )

        return res.status(201).json({
            msg: 'success login',
            user,
            token
        })
    } else {
        // 비밀번호가 일치하지 않는 경우
        res.status(409)
        throw new Error('password do not match')
    }

})

const logoutUser = expressAsyncHandler(async (req, res) => {

        res.json({
            msg: 'logout'
        })
})

const getProfile = expressAsyncHandler(async (req, res) => {
        res.json(req.user)
})

const getAllUserList = expressAsyncHandler( async (req, res) => {
        const users = await userModel.find()
        res.json(users)
})


export { userRegister, loggedUser, getProfile, getAllUserList, emailConfirm, findPassword, updatePasswordBeforeLogin, updatePasswordAfterLogin ,findEmail, logoutUser }