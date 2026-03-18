import Post from "../models/Post.js";
import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/User.js";
import { getSocketId, io } from "../socket.js";
import Notification from "../models/Notification.js";

export const uploadPost = async (req, res) => {
    try {
        const { caption, mediaType } = req.body
        let media;
        if (req.file) {
            media = await uploadOnCloudinary(req.file.path)
        } else {
            return res.status(400).json({ message: 'Media is required' })
        }
        const post = await Post.create({
            caption, media, mediaType, author: req.userId
        })
        const user = await User.findById(req.userId)
        user.posts.push(post._id)
        await user.save()

        const populatedPost = await Post.findById(post._id).populate('author', 'name email profilePic')
        return res.status(201).json(populatedPost)
    } catch (error) {
        return res.status(500).json({ message: `Upload post error: ${error}` })
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).populate('author', 'name email profilePic')
            .populate('comments.author', 'name email profilePic').sort({ createdAt: -1 })
        return res.status(200).json(posts)
    } catch (error) {
        return res.status(500).json({ message: `getAllPosts error: ${error}` })
    }
}

export const like = async (req, res) => {
    try {
        const postId = req.params.postId
        //  console.log(postId)
        const post = await Post.findById(postId).populate('author')
        if (!post) {
            return res.status(400).json({ message: 'Post not found' })
        }
        const alreadyLiked = post.likes.some(id => id.toString() == req.userId.toString())
        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() != req.userId.toString())
        } else {
            post.likes.push(req.userId)
            // notification
            if (post.author && post.author._id.toString() != req.userId.toString()) {
                const notification = await Notification.create({
                    sender: req.userId,
                    receiver: post.author._id,
                    type: 'like',
                    post: post._id,
                    message: 'liked your post'
                })
                const populatedNotification = await Notification.findById(notification._id).
                    populate('sender receiver post') // ✅ correct
                const receiverSocketId = getSocketId(post.author._id)
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('newNotification', populatedNotification)
                }

            }
        }
        await post.save()
        await post.populate('author', 'name email profilePic')
        // realtime like
        io.emit('likedPost', post)

        return res.status(200).json(post)

    } catch (error) {
        return res.status(500).json({ message: `LikePost error: ${error}` })
    }
}

export const comment = async (req, res) => {
    try {
        const { message } = req.body
        const postId = req.params.postId
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(400).json({ message: 'Post not found' })
        }
        post.comments.push({
            author: req.userId,
            message
        })
        // notification
        if (post.author._id != req.userId) {
            const notification = await Notification.create({
                sender: req.userId,
                receiver: post.author._id,
                type: 'comment',
                post: post._id,
                message: 'commented on your post'
            })
            const populatedNotification = await Notification.findById(notification._id).
                populate('sender receiver post') // ✅ correct
            const receiverSocketId = getSocketId(post.author._id)
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newNotification', populatedNotification)
            }

        }
        
        await post.save()
        await post.populate('author', 'name email profilePic')
        await post.populate('comments.author')
        // realtime
        io.emit('commentPost', post)
        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({ message: `Comment Error: ${error}` })
    }
}

// export const saved = async (req, res) => {
//   try {
//     const postId = req.params.postId
//     const user = await User.findById(req.userId)

//     if (!user.saved) user.saved = []

//     const alreadySaved = user.saved.some(id => id.toString() === postId.toString())

//     if (alreadySaved) {
//       // unsave post
//       user.saved = user.saved.filter(id => id.toString() !== postId.toString())
//     } else {
//       // save post
//       user.saved.push(postId)
//     }

//     await user.save()

//     // Properly populate saved posts + author
//     const populatedUser = await User.findById(req.userId)
//       .populate({
//         path: "saved",
//         populate: {
//           path: "author",
//           select: "name email profilePic"
//         }
//       })

//     return res.status(200).json(populatedUser)
//   } catch (error) {
//     console.error("Save post error:", error)
//     return res.status(500).json({ message: `Saved Post error: ${error.message}` })
//   }
// }

export const saved = async (req, res) => {
    try {
        const postId = req.params.postId
        const user = await User.findById(req.userId)

        if (!user.saved) user.saved = []

        const alreadySaved = user.saved.some(id => id.toString() === postId.toString())

        if (alreadySaved) {
            // unsave post
            user.saved = user.saved.filter(id => id.toString() !== postId.toString())
        } else {
            // save post
            user.saved.push(postId)
        }

        await user.save()

        // Populate saved posts with author info
        const populatedUser = await User.findById(req.userId)
            .populate({
                path: "saved",
                populate: {
                    path: "author",
                    select: "name profilePic"
                }
            })

        return res.status(200).json(populatedUser)
    } catch (error) {
        console.error("Save post error:", error)
        return res.status(500).json({ message: `Saved Post error: ${error.message}` })
    }
}