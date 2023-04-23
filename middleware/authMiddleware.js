import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

const protect = async (req, res, next) => {

    let token

    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // 토큰의 위치
        try{
            // 토큰 문자열 분리
            token = req.headers.authorization.split(' ')[1]
            // 토큰 디코딩 -> payload
            const decoded = await jwt.verify(token, 'kimjuhyeong')
            // payload 검색 -> 유저정보 req.user에 반환
            req.user = await userModel.findById(decoded.userId)

            next()
        } catch (err) {
            res.status(401)
            throw new Error(`Not authorized, token failed`)
        }
    }

      //   토큰이 없다면 401에러
      if (!token) {
          res.status(401)
          throw new Error('Not authorized, no token')
      }
}

export { protect }