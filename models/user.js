import mongoose from "mongoose";

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
        }
    },
    {
        timestamps: true
    }
)

const userModel = mongoose.model('user', userSchema)

export default userModel