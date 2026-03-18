import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    receiver:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    message:{type:String},
    image:{type:String}
},{timestamps:true})

export default mongoose.model('Message',messageSchema)