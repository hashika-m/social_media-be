import mongoose from 'mongoose'


const notificationSchema=new mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId,ref:'User',reqiured:true},
    receiver:{type:mongoose.Schema.Types.ObjectId,ref:'User',reqiured:true},
    type:{type:String,enum:['like','comment','follow'],reqiured:true},
    message:{type:String,reqiured:true},
    post:{type:mongoose.Schema.Types.ObjectId,ref:'Post'},
    loop:{type:mongoose.Schema.Types.ObjectId,ref:'Loop'},

    isRead:{
        type:Boolean,default:false
    }


},{timestamps:true})

export default mongoose.model('Notification',notificationSchema)