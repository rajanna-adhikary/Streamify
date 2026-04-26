import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
    } else {
        await Like.create({ video: videoId, likedBy: userId })
    }

    const likeCount = await Like.countDocuments({ video: videoId })
    const isLiked = !existingLike

    return res.status(200).json(
        new ApiResponse(200, { likeCount, isLiked }, existingLike ? "Video unliked" : "Video liked")
    )
})





const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment unliked"))
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: userId
    })

    return res
    .status(201)
    .json(new ApiResponse(201, like, "Comment liked"))

})







const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet unliked"))
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: userId
    })

    return res
    .status(201)
    .json(new ApiResponse(201, like, "Tweet liked"))


}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $ne: null }
    }).populate("video")  //ref id ko actual id m convert kar deta hai- jaake Video table se details fetch karke attach kar deta hai

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched")
    )
})

const getVideoLikeStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const [likeCount, userLike] = await Promise.all([
        Like.countDocuments({ video: videoId }),
        Like.findOne({ video: videoId, likedBy: userId })
    ])

    return res.status(200).json(
        new ApiResponse(200, { likeCount, isLiked: !!userLike }, "Like status fetched")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getVideoLikeStatus
}