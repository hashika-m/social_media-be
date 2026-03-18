import Post from "../models/Post.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/User.js"
import Notification from "../models/Notification.js"
import { getSocketId, io } from "../socket.js"

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId
    // const user = await User.findById(userId)
    // .populate('posts loops following friends followers posts.author posts.comments saved saved.author')
    const user = await User.findById(userId)
      .populate("following")
      .populate("followers")
      .populate({
        path: "posts",
        populate: { path: "author", select: "name profilePic" }
      })
      .populate({
        path: "saved",
        populate: { path: "author", select: "name profilePic" }
      })
    if (!user) {
      return res.status(400).json({ message: 'User not found !' })
    }

    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: `Current User Error:${error}` })
  }
}

export const suggestedUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.userId }
    }).select('-password').populate('following')
    return res.status(200).json(users)
  } catch (error) {
    return res.status(500).json({ message: `Suggested users: ${error}` })
  }
}

export const editProfile = async (req, res) => {

  try {

    console.log("req.file:", req.file)   // 👈 add it here
    console.log("req.body:", req.body)
    const { name, email, bio, profession, gender } = req.body

    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    const sameUserWithEmail = await User.findOne({ email })

    if (
      sameUserWithEmail &&
      sameUserWithEmail._id.toString() !== user._id.toString()
    ) {
      return res.status(400).json({ message: "User email already exists" })
    }

    let profilePic

    // if (req.file) {
    //     console.log("file:", req.file)
    //     profilePic = await uploadOnCloudinary(req.file.path)
    //     // console.log('cloud',profilePic)
    // }
    const file = req.files?.profilePic?.[0]

    if (file) {
      profilePic = await uploadOnCloudinary(file.path)
      user.profilePic = profilePic
    }

    if (profilePic) {
      user.profilePic = profilePic
    }

    user.name = name
    user.email = email
    user.bio = bio
    user.profession = profession
    user.gender = gender

    await user.save()

    return res.status(200).json({ user })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: `Edit profile error: ${error}` })
  }
}


export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user without password
    const user = await User.findById(id)
      .select("-password")
      .populate('followers following') // optional
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    // Get user's posts with author info
    const posts = await Post.find({ author: id })
      .populate('author', 'name profilePic') // ✅ populate author
      .sort({ createdAt: -1 }); // optional: newest first

    return res.status(200).json({
      ...user,
      post: posts
    });
  } catch (error) {
    return res.status(400).json({ message: `Get Profile Error: ${error}` });
  }
};

export const follow = async (req, res) => {
  try {
    const currentUserId = req.userId
    const targetUserId = req.params.targetUserId

    if (!targetUserId) return res.status(400).json({ message: 'Target user not found' })
    if (currentUserId === targetUserId)
      return res.status(400).json({ message: 'You cannot follow yourself' })

    const currentUser = await User.findById(currentUserId)
    if (!currentUser) return res.status(404).json({ message: 'Current user not found' })

    const targetUser = await User.findById(targetUserId)
    if (!targetUser) return res.status(404).json({ message: 'Target user not found' })


    currentUser.following = currentUser.following || []
    targetUser.followers = targetUser.followers || []


    const isFollowing = currentUser.following.includes(targetUserId)

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId)
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId)
      await currentUser.save()
      await targetUser.save()
      const updatedCurrent = await User.findById(currentUserId).populate('following friends followers').lean()
      return res.status(200).json({ following: false, updatedUser: updatedCurrent })
    } else {
      // Follow
      currentUser.following.push(targetUserId)
      targetUser.followers.push(currentUserId)
      // notification
      if (currentUser._id != targetUser._id) {
        const notification = await Notification.create({
          sender: currentUser._id,
          receiver: targetUser._id,
          type: 'follow',
          message: 'started following you'
        })
        const populatedNotification = await Notification.findById(notification._id).
          populate('sender receiver')
        const receiverSocketId = getSocketId(targetUser._id)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newNotification', populatedNotification)
        }

      }
      await currentUser.save()
      await targetUser.save()
      const updatedCurrent = await User.findById(currentUserId).populate('following friends followers').lean()
      return res.status(200).json({ following: true, updatedUser: updatedCurrent })
    }


  } catch (error) {
    console.error('Follow error:', error)
    return res.status(500).json({ message: `Follow Error: ${error.message}` })
  }
}


export const followinList = async (req, res) => {
  try {
    const result = await User.findById(req.userId)
    return res.status(200).json(result?.following)
  } catch (error) {
    return res.status(400).json({ message: `Following List Error: ${error}` });
  }
}

export const search = async (req, res) => {
  try {
    const keyWord = req.query.keyWord;

    if (!keyWord) {
      return res.status(400).json({ message: "keyword is required" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: keyWord, $options: "i" } },
        { email: { $regex: keyWord, $options: "i" } }
      ]
    }).select("-password");

    return res.status(200).json(users);

  } catch (error) {
    return res.status(400).json({ message: `Search users Error: ${error}` });
  }
};

export const getAllNotification = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.userId
    }).populate("sender")
      .populate("receiver")
      .populate("post")
      .populate("loop")
    // console.log('allNotifications',notifications)

    return res.status(200).json(notifications)
  } catch (error) {
    return res.status(400).json({ message: ` Get Notification Error: ${error}` });
  }
}

export const markAsRead = async (req, res) => {
  try {

    // const {notificationId}=req.body

    const notificationId = req.params.notificationId
    const notification = await Notification.findById(notificationId).populate("sender")
      .populate("receiver")
      .populate("post")
      .populate("loop")
    notification.isRead = true
    notification.save()
    // if (Array.isArray(notificationId)) {
    //   await Notification.updateMany(
    //     { _id: { $in: notificationId }, receiver: req.userId },
    //     { $set: { isRead: true } }
    //   )

    // } else {
    //   await Notification.findByIdAndUpdate(
    //     { _id: notificationId, receiver: req.userId },
    //     { $set: { isRead: true } }
    //   )
    // }
    return res.status(200).json({ message: 'Marked as read' })
  } catch (error) {
    return res.status(400).json({ message: ` Mark as read Error: ${error}` });
  }
}