import mongoose from "mongoose";

const connectDatabase = async () => {
    try {
       await mongoose.connect(process.env.MONGO_DB)
       console.log('connected database')
    } catch (err) {
       console.error(err.message)
       process.exit(1)
    }
}

export default connectDatabase