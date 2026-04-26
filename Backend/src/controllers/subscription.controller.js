import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 🔁 TOGGLE SUBSCRIPTION (subscribe / unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // prevent self-subscription
    if (channelId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSub = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    // ❌ already subscribed → unsubscribe
    if (existingSub) {
        await existingSub.deleteOne();

        return res.status(200).json(
            new ApiResponse(200, {}, "Unsubscribed successfully")
        );
    }

    // ✅ not subscribed → subscribe
    const newSub = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    });

    return res.status(201).json(
        new ApiResponse(201, newSub, "Subscribed successfully")
    );
});


// 📥 Get all subscribers of a channel
// (who follow this user)
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const subscribers = await Subscription.find({
        channel: subscriberId
    }).populate("subscriber", "username email");

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});


// 📤 Get all channels a user is subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const channels = await Subscription.find({
        subscriber: channelId
    }).populate("channel", "username email");

    return res.status(200).json(
        new ApiResponse(200, channels, "Subscribed channels fetched successfully")
    );
});


// ✅ Check if current user is subscribed to a channel
const getSubscriptionStatus = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const [isSubscribed, subscriberCount] = await Promise.all([
        Subscription.findOne({ subscriber: req.user._id, channel: channelId }),
        Subscription.countDocuments({ channel: channelId })
    ]);

    return res.status(200).json(
        new ApiResponse(200, { isSubscribed: !!isSubscribed, subscriberCount }, "Subscription status fetched")
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getSubscriptionStatus
};