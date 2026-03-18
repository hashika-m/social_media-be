
import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { upload } from '../middlewares/multer.js'
import { getAllStories, getStoryByUserEmail, uploadStory, viewStory } from '../controllers/storyController.js'

const storyRouter = express.Router()

// Upload story
storyRouter.post('/upload', authMiddleware, upload.single('media'), uploadStory)

// Get story by user email
storyRouter.get('/getByUserEmail/:email', authMiddleware, getStoryByUserEmail)

// View story (mark as seen)
storyRouter.get('/view/:storyId', authMiddleware, viewStory)
// get follwers story
storyRouter.get('/getAll',authMiddleware,getAllStories)

export default storyRouter