import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'

import { upload } from '../middlewares/multer.js'
import { comment, getAllLoops, like, uploadLoop } from '../controllers/loopController.js'



const loopRouter=express.Router()

loopRouter.post('/upload',authMiddleware,upload.single('media'),uploadLoop)
loopRouter.get('/getAll',authMiddleware,getAllLoops)
loopRouter.get('/like/:loopId',authMiddleware,like)
// loopRouter.get('/saved/:postId',authMiddleware,saved)
loopRouter.post('/comment/:loopId',authMiddleware,comment)
export default loopRouter