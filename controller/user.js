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

        // // 유저 입력 받기
        // const { username, email, password, bio, role, phone } = req.body
        //
        // // 이메일 중복 체크
        // const user = await userModel.findOne({email})
        //
        // // 이메일이 중복되어 있다면 -> 409 에러
        // if (user) {
        //     res.status(409)
        //     throw new Error('email already exist')
        // }
        // // 중복되지 않는다면 -> 유저 정보 저장 (비밀번호는 저장하기전에 자동 암호화 됨)
        // const newUser = new userModel({
        //     username,
        //     email,
        //     password,
        //     bio,
        //     phone,
        //     role
        // })
        // // 유저 생성
        // const createdUser = await newUser.save()
        //
        // // 이메일 전송
        // // 1.이메일 인증용 토큰 생성
        // const emailToken = await jwt.sign(
        //     {email:createdUser.email},
        //     process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY,
        //     {expiresIn: '10m'}
        // )
        // // 2. 이메일 전송
        // await sendEmail(createdUser.email, '이메일 인증', emailConfirmTemplate(emailToken))
        //
        // // res
        // res.status(201).json({
        //     msg: 'success createuser',
        //     createdUser
        // })

        // body 로 이메일 정보 전송받음
        const { username, email, password, bio, phone } = req.body

        // 이메일 중복 체크 (기존 유저의 이메일과 연관되어 있는지)
        const user = await userModel.findOne({email})

        // 이메일 중복이라면
        if (user) {
            res.status(409).json({
                msg: 'email already exist'
            })
        }

        // 비밀번호 암호화 단계는 유저 생성시 자동으로 암호화되어 저장됨
        // 유저 생성

        const newUser = new userModel({
            username,
            email,
            password,
            bio,
            phone
        })

        const createdUser = await newUser.save()

        // 유저 생성 후 이메일 인증메일 발송
        // 1. 유저 이메일 인증용 토큰을 생성한다.

        const emailToken = await jwt.sign(
            {email: createdUser.email},
            process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY,
            {expiresIn: '10m'}
        )

        // 2.이메일 토큰 활용해 이메일 인증 메일 발송
        await sendEmail(createdUser.email, '이메일 인증', emailConfirmTemplate(emailToken))

        res.status(201).json({
            msg: '유저 생성 완료, 이메일을 확인해 주세요',
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

        // // 클라이언트가 헤더로 요청한 토큰을 받는다.
        // const token = req.headers.authorization.split(' ')[1]
        // // 토큰을 디코딩하여 토큰안에 들어있는 이메일 정보로 유저를 조회한다.
        // const { email } = await jwt.verify(token, process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY)
        // const user = await userModel.findOne({email})
        // // 만약 유저의 이메일 인증 여부(isEmail)가 true 이면 -> 이미 인증됬음으로 400 error
        // if (user.isEmail) {
        //     res.status(400)
        //     throw new Error('already email Authenticated user')
        // }
        // // 이메일 인증 여부가 false 이면 -> isEmail -> true -> 201
        // user.isEmail = true
        // await user.save()
        //
        // res.status(201).json({
        //     msg: 'create email Authenticated user'
        // })

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

        // // 1. 사용자로부터 이메일을 입력받는다.
        //     const { email } = req.body
        // // 2. 이메일에 해당하는 유저가 있는지를 확인하고
        //     const user = await userModel.findOne({email})
        // // 3. 유저가 없다면 -> 에러
        //     if (!user) {
        //         res.status(404)
        //         throw new Error('no user')
        //     }
        // // 4. 유저가 있다면 비밀번호 이메일 인증용 토큰을 생성하여
        //     const passwordConfirmToken = await jwt.sign(
        //         {userId:user._id},
        //         process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY,
        //         {expiresIn: '10m'}
        //     )
        // // 5. 비밀번호 이메일 인증용 템플릿과 함께 해당 이메일로 메일을 보낸다.
        //     await sendEmail(email, '비밀번호 찾기 이메일 인증', passwordConfirmTemplate(passwordConfirmToken))
        //
        //     return res.status(201).json({
        //         msg: 'send findPasswordConfirm email'
        //     })

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

        // const { phone } = req.body
        //
        //
        // const user = await userModel.findOne({phone})
        //
        // if (!user) {
        //     res.status(404)
        //     throw new Error('no user')
        // }
        //
        // res.status(200).json({
        //     msg: 'successful find email',
        //     email: user.email
        // })

        const { phone } = req.body

        const user = await userModel.findOne({phone})

        // 핸드폰 번호와 일치하는 유저가 없다면
        if (!user) {
            return res.status(404).json({
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

    // // 토큰은 header로 받고 , 새로운 비밀번호는 body로 받는다.
    // const { newPassword } = req.body
    // const  token  = req.headers.authorization.split(' ')[1]
    //
    // // 받은 토큰을 디코딩하여 user 정보를 조회한다.
    // const {userId} = jwt.verify(token, process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY)
    //
    // const user = await userModel.findById(userId)
    //
    // // user의 정보가 없다면, 404 에러
    // if (!user) {
    //     res.status(404)
    //     throw new Error('no user')
    // }
    // // user의 정보가 있다면 , 비밀번호 교체 후 db에 저장한다.
    // user.password = newPassword
    // await user.save()
    //
    // res.status(201).json({
    //     msg: 'success password change before login'
    // })


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

    res.status(201).json({
        msg: 'user change password success'
    })

})

const loggedUser =  expressAsyncHandler( async (req, res) => {
    // const { email, password } = req.body
    //
    // const user = await userModel.findOne({email})
    //
    // if (user && (await user.matchPassword(password)) ) {
    //     // 비밀번호가 일치한다면 토큰 발급
    //     const token = await jwt.sign(
    //         {userId:user._id, email:user.email},
    //         process.env.JWT_ACCESSTOKEN_SECRET_KEY,
    //         {expiresIn: '1h'}
    //     )
    //
    //     res.status(201).json({
    //         user,
    //         token
    //     })
    // } else {
    //    res.status(409) // conflict
    //    throw new Error('invalid email and password')
    // }


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

        return res.status(200).json({
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

const getProfile = expressAsyncHandler(async (req, res) => {
        res.status(200).json(req.user)
})

const getAllUserList = expressAsyncHandler( async (req, res) => {
        const users = await userModel.find()
        res.status(200).json(users)
})


export { userRegister, loggedUser, getProfile, getAllUserList, emailConfirm, findPassword, updatePasswordBeforeLogin, findEmail }