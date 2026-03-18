import mongoose from "mongoose";

const storySchema=new mongoose.Schema({
     author:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true},
     mediaType:{type:String, enum:['image','video'],required:true},
     media:{type:String,required:true},
     viewers:[{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true}],
//story disappears at 24 hrs= 24x60x60=86400
     createdAt:{type:Date, default:Date.now(),expires:86400 } 

},{timestamps:true})

export default mongoose.model('Story',storySchema)