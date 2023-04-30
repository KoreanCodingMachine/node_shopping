import {ExtractJwt, Strategy} from "passport-jwt";
import userModel from "../models/user.js";

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_ACCESSTOKEN_SECRET_KEY || 'kimjuhyeong'

const passportConfig = passport => {
    passport.use(
        new Strategy(opts, (payload, done) => {
            userModel
                .findById(payload.userId)
                .then(user => {
                    console.log("???????", user)
                    if (user) {
                        return done(null, user)
                    }
                    return done(null, false)
                })
                .catch(err => {
                    return done(err, false)
                })
        })
    )
}

export default passportConfig