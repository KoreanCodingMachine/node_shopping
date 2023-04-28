import userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import {emailConfirmTemplate, passwordConfirmTemplate, sendEmail} from "../config/sendEmail.js";
import expressAsyncHandler from "express-async-handler";

// 유저 회원가입시 이메일 인증
const userRegister =  expressAsyncHandler( async (req, res) => {

        // const { username, email, password, bio, phone, role } = req.body
        //
        // // 이메일 중복체크를 한다.
        // const user = await userModel.findOne({email})
        //
        // if (user) {
        //     res.status(409) // 서버의 요청 상태와 충돌
        //     throw new Error('이미 가입한 회원이 있습니다.')
        // }
        //
        // // 비밀번호를 암호화는 db에 비밀번호가 저장되기 전에 해쉬함수를 생성하여 자동 저장됨
        //
        // // db document 생성
        // const newUser = new userModel({
        //     username,
        //     email,
        //     password,
        //     bio,
        //     phone,
        //     role
        // })
        //
        // // 유저 생성
        // const createdUser = await newUser.save()
        //
        // // 이메일 확인용 토큰
        // const emailConfirmToken = await jwt.sign(
        //     {email: createdUser.email},
        //     process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY,
        //     {expiresIn: '10m'}
        // )
        //
        // // 이메일 전송
        // await sendEmail(createdUser.email, '이메일 확인', emailConfirmTemplate(emailConfirmToken))
        //
        // res.status(201).json({
        //     msg: 'success create user',
        //     createdUser
        // })

        // 유저 입력 받기
        const { username, email, password, bio, role, phone } = req.body

        // 이메일 중복 체크
        const user = await userModel.findOne({email})

        // 이메일이 중복되어 있다면 -> 409 에러
        if (user) {
            res.status(409)
            throw new Error('email already exist')
        }
        // 중복되지 않는다면 -> 유저 정보 저장 (비밀번호는 저장하기전에 자동 암호화 됨)
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

        // 이메일 전송
        // 1.이메일 인증용 토큰 생성
        const emailToken = await jwt.sign(
            {email:createdUser.email},
            process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY,
            {expiresIn: '10m'}
        )
        // 2. 이메일 전송
        await sendEmail(createdUser.email, '이메일 인증', emailConfirmTemplate(emailToken))

        // res
        res.status(201).json({
            msg: 'success createuser',
            createdUser
        })
})

// 이메일 인증 확인하는 api
const emailConfirm =  expressAsyncHandler(async (req, res) => {

        // const token = req.body.token
        //
        // const {email} = await jwt.verify(token, process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY)
        //
        // const user = await userModel.findOne({email})
        //
        // if (user.isEmail === true) {
        //     res.status(409) // conflict
        //     throw new Error('already isEmail true')
        // }
        //
        // user.isEmail = true
        // await user.save()
        //
        // res.status(201).json({
        //     msg: 'successful change isEmail'
        // })

        // 클라이언트가 헤더로 요청한 토큰을 받는다.
        const token = req.headers.authorization.split(' ')[1]
        // 토큰을 디코딩하여 토큰안에 들어있는 이메일 정보로 유저를 조회한다.
        const { email } = await jwt.verify(token, process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY)
        const user = await userModel.findOne({email})
        // 만약 유저의 이메일 인증 여부(isEmail)가 true 이면 -> 이미 인증됬음으로 400 error
        if (user.isEmail) {
            res.status(400)
            throw new Error('already email Authenticated user')
        }
        // 이메일 인증 여부가 false 이면 -> isEmail -> true -> 201
        user.isEmail = true
        await user.save()

        res.status(201).json({
            msg: 'create email Authenticated user'
        })
})

// 비밀번호 찾기 api
// 유저 이메일 입력 -> 이메일 인증메일 발송
const findPassword = expressAsyncHandler( async (req, res) => {

        // const {email} = req.body
        //
        // const user = await userModel.findOne({email})
        //
        // const findPasswordToken = await jwt.sign(
        //     {id: user._id},
        //     process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY,
        //     {expiresIn: '10m'}
        // )
        //
        // await sendEmail(user.email, '이메일 확인', passwordConfirmTemplate(findPasswordToken))
        //
        // res.status(201).json({
        //     msg: 'please check your email'
        // })

        // 1. 사용자로부터 이메일을 입력받는다.
            const { email } = req.body
        // 2. 이메일에 해당하는 유저가 있는지를 확인하고
            const user = await userModel.findOne({email})
        // 3. 유저가 없다면 -> 에러
            if (!user) {
                res.status(404)
                throw new Error('no user')
            }
        // 4. 유저가 있다면 비밀번호 이메일 인증용 토큰을 생성하여
            const passwordConfirmToken = await jwt.sign(
                {userId:user._id},
                process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY,
                {expiresIn: '10m'}
            )
        // 5. 비밀번호 이메일 인증용 템플릿과 함께 해당 이메일로 메일을 보낸다.
            await sendEmail(email, '비밀번호 찾기 이메일 인증', passwordConfirmTemplate(passwordConfirmToken))

            return res.status(201).json({
                msg: 'send findPasswordConfirm email'
            })
})

// 이메일 찾기 api
// 핸드포 번호 입력 -> 유저 스키마에서 핸드폰번호 조회 , 해당 유저의 이메일 알려줌
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

// 로그인전 비밀번호 업데이트 api
// 비밀번호 찾기 시 발송한 이메일에 링크로 접속하면
// 토큰와 , 새로운 비밀번호를 받아 새로운 비밀번호로 대체 해주는 api
const updatePasswordBeforeLogin = expressAsyncHandler( async (req, res) => {

        // const { token, newPassword } = req.body
        //
        // const { id } = await jwt.verify(token, process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY)
        //
        // const user = await userModel.findById(id)
        //
        // user.password = newPassword
        //
        // await user.save()
        //
        // res.status(201).json({
        //     msg: 'updated password'
        // })

    // 토큰은 header로 받고 , 새로운 비밀번호는 body로 받는다.
    const { newPassword } = req.body
    const  token  = req.headers.authorization.split(' ')[1]
    
    // 받은 토큰을 디코딩하여 user 정보를 조회한다.
    const {userId} = jwt.verify(token, process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY)
    console.log(userId)
    const user = await userModel.findById(userId)
    console.log(user)
    // user의 정보가 없다면, 404 에러
    if (!user) {
        res.status(404)
        throw new Error('no user')
    }
    // user의 정보가 있다면 , 비밀번호 교체 후 db에 저장한다.
    user.password = newPassword
    await user.save()

    res.status(201).json({
        msg: 'success password change before login'
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
})

const getProfile = expressAsyncHandler(async (req, res) => {
        res.status(200).json(req.user)
})

const getAllUserList = expressAsyncHandler( async (req, res) => {
        const users = await userModel.find()
        res.status(200).json(users)
})


export { userRegister, loggedUser, getProfile, getAllUserList, emailConfirm, findPassword, updatePasswordBeforeLogin, findEmail }