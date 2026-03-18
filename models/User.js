import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: Date},
    profilePic: { type: String },
    bio:{type:String},
    profession:{type:String},
    gender:{type:String,enum:['male','female','others']},
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    saved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    loops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Loop' }],
    story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' }



}, { timestamps: true })

export default mongoose.model('User', userSchema)
