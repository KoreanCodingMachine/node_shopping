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
        bio: {
            type: Boolean,
            default: true, // true -> 남자 , false -> 여자
        },
        role: {
            type: String,
            default: 'user'
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre('save', async function(next){
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    } catch (err) {
        console.log(err.message)
    }
})

userSchema.methods.matchPassword = async function (enterPassword){
    return await bcrypt.compare(enterPassword, this.password)
}

const userModel = mongoose.model('user', userSchema)
export default userModel