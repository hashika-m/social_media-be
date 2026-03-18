import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'

import { upload } from '../middlewares/multer.js'
import { comment, getAllPosts, like, saved, uploadPost } from '../controllers/postController.js'


const postRouter=express.Router()

postRouter.post('/upload',authMiddleware,upload.single('media'),uploadPost)
postRouter.get('/getAll',authMiddleware,getAllPosts)
postRouter.get('/like/:postId',authMiddleware,like)
postRouter.post('/saved/:postId', authMiddleware, saved)
postRouter.post('/comment/:postId',authMiddleware,comment)
export default postRouter