import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // firebaseUid provide unique id names as { uid } in response
    firebaseUid:{
        type:String,
        unique:true
    },
    name:String,
    email:String,
    avatar:String,
    plan:{
        type:String,
        default:"free"
    },
    credits:{
        type:Number,
        default:100
    },
    totalCredits:{
        type:Number,
        default:100
    },
    planExpriresAt:Date
    
},{
    timestamps:true
})

const User = mongoose.model("User", userSchema)
export default User