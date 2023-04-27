import express from "express";
import {isAdmin, protect} from "../middleware/authMiddleware.js";
import {
    userRegister,
    loggedUser,
    getProfile,
    getAllUserList,
    emailConfirm,
    findPassword, updatePasswordBeforeLogin, findEmail
} from "../controller/user.js";

const router = express.Router()


// 회원가입
router.post('/register', userRegister )

// 이메일 확인
router.put('/email/confirm', emailConfirm)

// 이메일 찾기
router.post('/find/email', findEmail)

// 패스워드 확인
router.post('/find/password', findPassword)

// 패스워드 변경 (로그인 전)
router.put('/update/password', updatePasswordBeforeLogin)

// 로그인
router.post('/login', loggedUser)


// 프로필정보
// 프로필정보를 가져오려면 로그인후에 이용해야한다. -> protect middleware 사용
router.get('/', protect, getProfile)


// 유저 전체 리스트 가져오기
router.get('/list',protect, isAdmin ,getAllUserList)

export default router