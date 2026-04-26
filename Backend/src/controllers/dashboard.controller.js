import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// 📊 CHANNEL STATS
const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // total videos
    const totalVideos = await Video.countDocuments({
        owner: userId
    });

    // total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    // total views (aggregation 🔥)
    const viewsResult = await Video.aggregate([
        {
            $match: { owner: userId }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    const totalViews = viewsResult[0]?.totalViews || 0;

    // total likes (aggregation 🔥)
    const likesResult = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoData"
            }
        },
        {
            $unwind: "$videoData"
        },
        {
            $match: {
                "videoData.owner": userId
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: 1 }
            }
        }
    ]);

    const totalLikes = likesResult[0]?.totalLikes || 0;

    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalSubscribers,
            totalViews,
            totalLikes
        }, "Channel stats fetched successfully")
    );
});


// 🎥 CHANNEL VIDEOS
const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const videos = await Video.find({ owner: userId })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
});


export {
    getChannelStats,
    getChannelVideos
};





/*
In my backend project, I implemented an analytics dashboard using MongoDB aggregation pipelines to compute channel-level insights. For basic metrics like total videos and subscribers, I used efficient `countDocuments` queries, while for derived metrics like total views and likes, I used aggregation. For example, total views are calculated by filtering my videos using `$match` and then summing their `views` field using `$group`. The more interesting part is total likes, because the Like collection only stores a reference to the video (`videoId`) and not the owner, so I used `$lookup` (similar to a SQL join) to join the likes collection with the videos collection, then `$unwind` to flatten the joined array, `$match` to filter only those likes where the video’s owner is the current user, and finally `$group` to count them. This approach demonstrates handling of relational data in a NoSQL database, efficient querying, and the ability to derive meaningful insights from distributed collections, which is essential for building scalable backend systems.
*/