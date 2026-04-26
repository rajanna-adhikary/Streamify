import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

//1
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
     const filter = {}

    if (query) {
        filter.title = { $regex: query, $options: "i" }
    }

    if (userId && isValidObjectId(userId)) {
        filter.owner = userId
    }

    const videos = await Video.find(filter)
        .populate("owner", "username fullName avatar")
        .sort({ [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )
})
//2
const publishAVideo = asyncHandler(async (req, res) => {
    
    // TODO: get video, upload to cloudinary, create video
     const { title, description } = req.body

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Error uploading files")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration || 0,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    )
})
//3

const getVideoById = asyncHandler(async (req, res) => {
   
    //TODO: get video by id
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
    ).populate("owner", "username fullName avatar")

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // push to watch history of logged-in user (ignore errors silently)
    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { watchHistory: videoId }
        }).catch(() => {})
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})
//4

const updateVideo = asyncHandler(async (req, res) => {
    
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    let thumbnail;

    if (req.file?.path) {
        thumbnail = await uploadOnCloudinary(req.file.path)
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: thumbnail?.url || video.thumbnail
            }
        },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated")
    )

})
//5

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted")
    )
})

//6
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "Publish status toggled")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}