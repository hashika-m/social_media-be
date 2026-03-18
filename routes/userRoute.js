import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { editProfile, follow, followinList, getAllNotification, getCurrentUser, getProfile, markAsRead, search, suggestedUsers } from '../controllers/userController.js'
import { upload } from '../middlewares/multer.js'


const userRouter=express.Router()

userRouter.get('/current',authMiddleware,getCurrentUser)
userRouter.get('/suggested',authMiddleware,suggestedUsers)
userRouter.get('/getProfile/:id',authMiddleware,getProfile)
userRouter.post('/follow/:targetUserId',authMiddleware,follow)
// userRouter.post('/friend/:targetUserId', authMiddleware, toggleFriend);
// userRouter.post('/editProfile',authMiddleware,upload.single('profilePic'),editProfile)
userRouter.get('/followingList',authMiddleware,followinList)
userRouter.get('/search',authMiddleware,search)
userRouter.get('/getAllNotifications',authMiddleware,getAllNotification)
userRouter.post('/markAsRead',authMiddleware,markAsRead)
userRouter.post('/editProfile',authMiddleware,upload.fields([{ name: "profilePic", maxCount: 1 }]),editProfile)
export default userRouter