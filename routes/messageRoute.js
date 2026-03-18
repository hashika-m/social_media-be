import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'

import { upload } from '../middlewares/multer.js'
import { getAllMessages, getPrevUserChats, sendMessage } from '../controllers/messageController.js'




const messageRouter=express.Router()

messageRouter.post('/send/:receiverId',authMiddleware,upload.single('image'),sendMessage)
messageRouter.get('/getAll/:receiverId',authMiddleware,getAllMessages)
messageRouter.get('/prevChats',authMiddleware,getPrevUserChats)

export default messageRouter