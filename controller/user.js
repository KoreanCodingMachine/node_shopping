import userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import {emailConfirmTemplate, passwordConfirmTemplate, sendEmail} from "../config/sendEmail.js";


const userRegister = async (req, res) => {

    const { username, email, password, bio, phone, role } = req.body

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

const emailConfirm = async (req, res) => {

    const token = req.body.token

    try {
        const {email} = await jwt.verify(token, process.env.EMAIL_CONFIRM_ACCESS_TOKEN_KEY)
        console.log(email)
        const user = await userModel.findOne({email})
        console.log('????????????????', user)
        if (user.isEmail === true) {
            return res.status(410).json({
                msg: 'already isEmail is true'
            })
        }

        user.isEmail = true
        await user.save()

        res.json({
            msg: 'successful change isEmail'
        })
    } catch (err) {
        res.status(500).json({
            msg: err.message
        })
    }
}

const findPassword = async (req, res) => {

    const {email} = req.body

    try {
        const user = await userModel.findOne({email})

        const findPasswordToken = await jwt.sign(
            {id: user._id},
            process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY,
            {expiresIn: '10m'}
        )

        await sendEmail(user.email, '이메일 확인', passwordConfirmTemplate(findPasswordToken))

        res.json({
            msg: 'please check your email'
        })


    } catch (err) {
        res.status(500).json({
            msg: err.message
        })
    }
}

const findEmail = async (req, res) => {

    const { phone } = req.body

    try {
        const user = await userModel.findOne({phone})

        if (!user) {
            return res.status(400).json({
                msg: 'no user'
            })
        }

        res.json({
            msg: 'successful find email',
            email: user.email
        })

    } catch (err) {
        res.status(500).json({
            msg: err.message
        })
    }
}

const updatePasswordBeforeLogin = async (req, res) => {

    const { token, newPassword } = req.body

    try {
        const { id } = await jwt.verify(token, process.env.FIND_PASSWORD_ACCESS_TOKEN_KEY)

        const user = await userModel.findById(id)

        user.password = newPassword

        await user.save()

        res.json({
            msg: 'updated password'
        })
    } catch (err) {

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


export { userRegister, loggedUser, getProfile, getAllUserList, emailConfirm, findPassword, updatePasswordBeforeLogin, findEmail }