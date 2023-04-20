import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

const protect = async (req, res, next) => {
    let token

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]

            const decoded = jwt.verify(token, "kimjuhyeong")
            req.user = await userModel.findById(decoded.userId)

            next()
        } catch (err) {
            res.status(401)
            throw new Error(`Not authorized, token failed`)
        }
    }

    if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
}

export { protect }