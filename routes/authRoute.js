import express from 'express'
import { forgotPassword, resetPassword, signIn, signOut, signUp } from '../controllers/authController.js'

const authRouter=express.Router()


authRouter.post('/signup',signUp)
authRouter.post('/signin',signIn)
authRouter.get('/signout',signOut)
authRouter.post('/forgotPassword',forgotPassword)
authRouter.post('/resetPassword/:token',resetPassword)

export default authRouter
