import express from "express";
import userModel from "../models/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {protect} from "../middleware/authMiddleware.js";
import { userRegister, loggedUser, getProfile, getAllUserList } from "../controller/user.js";

const router = express.Router()


// 회원가입
router.post('/register', userRegister )


// 로그인
router.post('/login', loggedUser)


// 프로필정보
// 프로필정보를 가져오려면 로그인후에 이용해야한다. -> protect middleware 사용
router.get('/', protect, getProfile)


// 유저 전체 리스트 가져오기
router.get('/list', getAllUserList)

export default router