import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}









const registerUser= asyncHandler(async(req,res)=>{
    //WE WILL TAKE REFERNCE FROM USER MODEL
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
     const {fullName, email, username, password } = req.body
    console.log("email: ", email);

    
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    // console.log(req.files);
    // console.log(existedUser)
    // console.log(req.body)
     const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path; cause iagar user cover imge nhi de raha toh error throw kar raha hai isiliye neeche wala if else lagaya hai

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    let coverImage;

if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath)
}

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        avatarPublicId: avatar.public_id,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })//db

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )//weird suntax

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})
//LOGINNNNNNNNNNNNNNNNNNNNNNNNN
const loginUser = asyncHandler(async (req, res) =>{
    // 1.req body -> data
    // 2.username or email
    //3.find the user
    //4.password check
    //5.access and referesh token
    //6.send cookie
//1
    const {email, username, password} = req.body
    console.log(email);
//2
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }
//3
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
//4
   const isPasswordValid = await user.isPasswordCorrect(password) //ispassword correct func hai in user.model.js in the form of middleware           //user. yaha User nhi karna woh mongodb ke methods jo hai woh milenge like findone updateone.....hume toh user (jo humne banay hai) uske methods liek ispasssword correct yeh sab ka method ka access milega

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }
//5 uper method bhi lika hua hai
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
//6
 const options = {
        httpOnly: true, ////To prevent man-in-the-middle attacks/If someone intercepts HTTP traffic, they could steal tokens.
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )


})

//LOGOUTTTTTTTTTTTTTTTTTTTTTTT
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document//null undefined wale chiz se chuthkara
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


//WAPSSSSSSSSSSSS REFRESHHHHHHHHHHHHHH TOKEN GENNNNNNNNNNNNNNNNN TAAKI ACCESS TOKENNNNNNNNNNN MILEEEEEEEEE

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
           secure: process.env.NODE_ENV === "production"
        }

        // ✅ FIXED
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})
//USER CHNAGEEEEEEEEEEEEEEEE PASSSSSSSSSSSSSS
//To change password securely, we first verify the old password using bcrypt comparison, then update the password and rely on a pre-save middleware to hash the new password before storing it.
const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


///////
const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})
///////update accountttttttttttt detailsSSSSSSSSSSSSSSSSSSSSSSSSS
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName?.trim() || !email?.trim()) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({ email })

    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        throw new ApiError(409, "Email already in use")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName.trim(),
                email: email.toLowerCase().trim()
            }
        },
        { new: true }   //THIS IS VERY IMP new wala return karega
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    )
})
/////////
const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment(done)

    const user = await User.findById(req.user._id)

    if (user?.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId)
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url,
                 avatarPublicId: avatar.public_id
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedUser, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})


////////////////PIPELINESSSSSSSSSSSSSSSSSSSSSS
const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()  //filter (siko pehle lagao to reduce the search space)
            }
        },
        {
            $lookup: {    //join in mongo
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: { // to add new fields
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {   // ITS LIKE THE  BUTTON THT VAL(TRUE/FALSE) TO BE SEND TO FRONTEND FROM THAT THEY WILL GET TO KNOW IF SUBSCRIBED OR NOT(FOLLOW BTN)
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: { // bas inhi ko return karo
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})  //ALL THE INFO ABOUT CHANNEL FETCHED (SUBS CNT, TUMNE KITNA SUNSCRIBE KIA CNT....ETC ETC)

//////////////////////NESTED  LOOKUP

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})



export {registerUser
    ,loginUser,
    logoutUser,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchHistory

}
// 🔟 Without asyncHandler

// You would need this everywhere:

// const registerUser = async (req,res,next) => {
//     try {
//         res.status(200).json({message:"ok"})
//     }
//     catch(err){
//         next(err)
//     }
// }

// In every controller.

// 11️⃣ With asyncHandler

// Cleaner:

// const registerUser = asyncHandler(async (req,res)=>{
//     res.status(200).json({message:"ok"})
// })

// No try/catch needed.




//read if any doubt

/*
Perfect idea 👍 Making **short notes** is the best way to remember aggregation.
I’ll summarize **everything we discussed from start → till now** in **2–3 lines each** so you can paste directly in notes.

---

# 1️⃣ Subscription Schema (User Subscribe System)

* `subscriber` = user who subscribes, `channel` = user being subscribed to.
* Both store `ObjectId` referencing the **User collection**.
* Each document represents **one subscription relation** (like a bridge table in SQL).

---

# 2️⃣ Why `ObjectId` + `ref`

* `ObjectId` stores the **ID of another document**.
* `ref: "User"` tells Mongoose this ID belongs to the **User collection**.
* This enables joins using **populate or aggregation `$lookup`**.

---

# 3️⃣ MongoDB Aggregation Pipeline Concept

* Aggregation = process data step-by-step to transform it.
* Pipeline = chain of stages like `$match → $lookup → $project`.
* Each stage receives output of previous stage and transforms it.

---

# 4️⃣ `$match`

* Works like **SQL WHERE**.
* Filters documents early to **reduce search space**.
* Example: find a user by `username`.

---

# 5️⃣ `$lookup` (MongoDB Join)

* Used to **join two collections**.
* Requires:

  * `from` → collection name
  * `localField` → field in current collection
  * `foreignField` → field in other collection
* Result is **always an array**.

---

# 6️⃣ Channel Profile Aggregation

Goal: fetch channel info + subscribers count.

Pipeline flow:

```
User
 ↓
$match (find username)
 ↓
$lookup (find subscribers)
 ↓
$lookup (channels subscribed to)
 ↓
$addFields (counts + isSubscribed)
 ↓
$project (select fields)
```

---

# 7️⃣ `$addFields`

* Adds new computed fields to document.
* Example:

  * `subscribersCount`
  * `channelsSubscribedToCount`
* Uses operators like `$size`, `$cond`.

---

# 8️⃣ `$size`

* Returns **length of an array**.
* Used to count subscribers.

Example:

```
$size: "$subscribers"
```

---

# 9️⃣ `$cond`

* Works like **if-else** in aggregation.

Example:

```
$cond:
 if: condition
 then: true
 else: false
```

Used to check if current user is subscribed.

---

# 🔟 `$project`

* Controls which fields are returned in output.
* Used to **hide unnecessary fields**.

Example:

```
$project:
 fullName:1
 username:1
 avatar:1
```

---

# 1️⃣1️⃣ Why Aggregation Returns Array

* `aggregate()` always returns **array of documents**.
* Even if only one document matches.

Example:

```
[
 { user data }
]
```

So we access:

```
channel[0]
```

---

# 1️⃣2️⃣ Avoiding `array[0]`

Instead of:

```
const user = await aggregate()
user[0]
```

Use **destructuring**:

```
const [user] = await aggregate()
```

Now directly use:

```
user.watchHistory
```

---

# 1️⃣3️⃣ Why `new mongoose.Types.ObjectId()`

Aggregation compares **BSON types strictly**.

Example:

```
ObjectId("123") !== "123"
```

So convert string → ObjectId:

```
new mongoose.Types.ObjectId(id)
```

---

# 1️⃣4️⃣ Watch History Problem

User document stores:

```
watchHistory: [videoId]
```

But frontend needs:

```
video title
thumbnail
owner details
```

So we must fetch **video documents**.

---

# 1️⃣5️⃣ First `$lookup` (Videos)

Converts:

```
watchHistory = [videoId]
```

into:

```
watchHistory = [video objects]
```

Using:

```
$lookup from videos
```

---

# 1️⃣6️⃣ Nested `$lookup`

Video has:

```
owner: userId
```

But frontend needs owner details.

So inside video lookup we run another lookup:

```
videos
 ↓
lookup users
```

This is called **nested lookup**.

---

# 1️⃣7️⃣ Owner `$project`

Only necessary fields are returned:

```
fullName
username
avatar
```

Sensitive data like password is hidden.

---

# 1️⃣8️⃣ `$first`

`$lookup` returns arrays.

Example:

```
owner: [ {...} ]
```

But we want:

```
owner: {...}
```

So we use:

```
$first: "$owner"
```

---

# 1️⃣9️⃣ Final Watch History Pipeline Flow

```
User
 ↓
$match (logged-in user)
 ↓
$lookup videos
 ↓
nested lookup users (video owner)
 ↓
$project owner fields
 ↓
$addFields ($first owner)
 ↓
return watchHistory
```

---

# 2️⃣0️⃣ Why Aggregation is Powerful

Without aggregation you would do:

```
User query
Video query for each video
Owner query for each video
```

Many database calls ❌

Aggregation does everything in **one query** ✅

---

# ⭐ Final Mental Model

```
User
 │
 │ watchHistory [videoId]
 ▼
Videos
 │
 │ owner userId
 ▼
Users
```

Pipeline:

```
User → Videos → Users
```

---

✅ These notes cover **everything we discussed in this chat**.

---

If you want, I can also make a **SUPER SHORT 1-page "MongoDB Aggregation Cheat Sheet" (the 10 operators used in 90% backend systems)**.
It will help a lot in **placements + backend interviews** since you’re doing **Node + Mongo backend**.
*/