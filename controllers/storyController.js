
import uploadOnCloudinary from "../config/cloudinary.js"
import Story from "../models/Story.js"
import User from "../models/User.js"
export const uploadStory = async (req, res) => {
    try {

        const { mediaType } = req.body

        let media

        if (req.file) {
            media = await uploadOnCloudinary(req.file.path)
        } else {
            return res.status(400).json({ message: 'media is required' })
        }

        const story = await Story.create({
            author: req.userId,
            mediaType,
            media
        })

        const populatedStory = await Story.findById(story._id)
            .populate('author', 'name email profilePic')
            .populate('viewers', 'name email profilePic')

        return res.status(200).json(populatedStory)

    } catch (error) {
        return res.status(500).json({ message: `Story upload error: ${error}` })
    }
}
// Get stories by user email
export const getStoryByUserEmail = async (req, res) => {
    try {
        const email = req.params.email
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: "User not found" })

        const stories = await Story.find({ author: user._id })
            .populate('author', 'name email profilePic')
            .populate('viewers', 'name email profilePic')

        return res.status(200).json(stories)
    } catch (error) {
        return res.status(500).json({ message: `Get story error: ${error}` })
    }
}

// View story
export const viewStory = async (req, res) => {
    try {
        const storyId = req.params.storyId
        const story = await Story.findById(storyId)
        if (!story) return res.status(400).json({ message: "Story not found" })

        const viewersIds = story.viewers.map(id => id.toString())
        if (!viewersIds.includes(req.userId.toString())) {
            story.viewers.push(req.userId)
            await story.save()
        }

        const populatedStory = await Story.findById(story._id)
            .populate('author', 'name email profilePic')
            .populate('viewers', 'name email profilePic')

        return res.status(200).json(populatedStory)
    } catch (error) {
        return res.status(500).json({ message: `Story view error: ${error}` })
    }
}

export const getAllStories = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId)
        const followingIds = currentUser.following
        // const stories=await Story.find({
        //     author:{$in:followingIds}
        // }).populate('viewers author')
        //   .sort({createdAt:-1})
        const stories = await Story.find({
           author: { $in: [...followingIds, req.userId] }
        })
            .populate('author', 'name email profilePic')
            .populate('viewers', 'name email profilePic')
            .sort({ createdAt: -1 })
        return res.status(200).json(stories)
    } catch (error) {
        return res.status(500).json({ message: 'All stories get error' })
    }
}