import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

// 현재 로그인된 유저 정보
const protect = async (req, res, next) => {
    let token

    if ( req.headers.authorization &&
         req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 토큰 정제
            token = req.headers.authorization.split(' ')[1]
            // 토큰 디코딩
            const decoded = await jwt.verify(token, process.env.JWT_ACCESSTOKEN_SECRET_KEY)
            // 디코딩된 정보로 유저정보 조회
            req.user = await userModel.findById(decoded.userId)

            next()
        } catch (err){
            res.status(401).json({
                msg: 'invalid token'
            })

        }
    }

    if (!token) {
        res.status(401).json({
            msg: 'not authorized, no token'
        })
        // throw new Error('not authorized, no token')
    }
}

const isAdmin = (req, res, next) => {
    // if (req.user.role !== 'admin') {
    //     res.status(401).json({
    //         msg: 'Not authorized as an admin'
    //     })
    // }
    // next()
    console.log(req.user)
    if (req.user && req.user.role === 'admin') {
        next()
    } else {
        res.status(408).json({
            msg: `not authorized as an admin`
        })
    }
}


export { protect, isAdmin }