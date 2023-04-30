import JWTStrategy from "passport-jwt";
import LocalStrategy from 'passport-local'
import userModel from "../models/user.js";


const opts = {}
opts.jwtFromRequest = JWTStrategy.ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_ACCESSTOKEN_SECRET_KEY || 'kimjuhyeong'

const passportConfig = passport => {
    passport.use(
        new JWTStrategy.Strategy(opts, (payload, done) => {
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

    // passport.use(
    //     new LocalStrategy.Strategy((email, password, done) => {
    //         const user = userModel.findOne({email})
    //         if (!user || err) {
    //             return done(err)
    //         }
    //
    //         const isMatched = userModel.matchPassword(password)
    //
    //         if (!isMatched) {
    //             return done("incorrect password", false)
    //         }
    //
    //         return done(null, user)
    //     })
    // )

}

export default passportConfig

// import LocalStrategy from 'passport-local'
// import JWTStrategy from 'passport-strategy'
// import userModel from "../models/user.js";
//
//
// const passportLoginVerify = async (username, password, done) => {
//     try {
//         const user = await userModel.findOne({email: username})
//
//         if (!user) {
//             done(null, false, { message: '존재하지 않는 사용자입니다'})
//             return
//         }
//         const isMatched = await userModel.matchPassword(password)
//
//         if (isMatched) {
//             done(null, user)
//             return
//         }
//
//         done(null, false, {reason: '올바르지 않은 비밀번호 입니다.'})
//
//     } catch (err){
//         console.log(err)
//         done(e)
//     }
// }
//
// let passportConfig = {
//     usernameField: 'email',
//     passwordField: 'password'
// }
//
// passport.use(
//     'local',
//     new LocalStrategy.Strategy(passportConfig, passportLoginVerify)
// )
//
// export default passportLoginVerify