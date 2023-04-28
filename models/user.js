import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
    {
        // username,email,password,bio
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        isEmail: {
            type: Boolean,
            default: false
        },
        bio: {
            type: Boolean,
            default: true, // true -> 남자 , false -> 여자
        },
        role: {
            type: String,
            default: 'user'
        },
        phone: {
            type: String,
            unique:true,
            required: true
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre('save', async function(next){
    // salt 값 생성
    const salt = await bcrypt.genSalt(10)
    // userSshema의 password 를 해쉬함수로 변경하여 저장
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

// 유저 로그인시 비밀번호 검증하는 메소드 생성
userSchema.methods.matchPassword = async function (enterPassword){
    return await bcrypt.compare(enterPassword, this.password)
}

const userModel = mongoose.model('user', userSchema)
export default userModel