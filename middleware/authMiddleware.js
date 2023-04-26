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
            const decoded = await jwt.verify(token, 'kimjuhyeong')
            // 디코딩된 정보로 유저정보 조회
            req.user = await userModel.findById(decoded.userId)

            next()
        } catch (err){
            res.status(401)
            throw new Error(`Not authorized, token failed`)
        }
    }

    if (!token) {
        res.status(401)
        throw new Error('not authorized, no token')
    }
}

export { protect }