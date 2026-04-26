import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { verifyJWT } from "./middlewares/auth.middleware.js"
const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//eg form bhara data lia
app.use(express.json({limit:"16kb"}))

//url wale time lena hai toh---(kahi lahi space ka url encoded hota %20,+ etc etc woh sab bhi handle karna padhta hai)
app.use(express.urlencoded({extended:true,limit:"16kb"}))

//images aayi toh mai mere server m store rakhna chahti
app.use(express.static("public"))

app.use(cookieParser())



//here we are going to import all the routes , not in index.js
//and also after doing all the shit with middlewares we are importing here(imp)
//so we will be using app.use (middleware act kar raha na router) ab kaha direct server m hi sab likh dia so no app.get
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users",userRouter) //jab user /user hit karega tabh hu userRouter m jaenge...**1
//i.e url now= https://localhost:8000/api/v1/users (now go to route)

//videoooooooooooo
import videoRouter from "./routes/video.routes.js"
app.use("/api/v1/videos",videoRouter)


//likes
import likeRouter from "./routes/like.routes.js"
app.use("/api/v1/likes", likeRouter)



//comments
import commentRouter from "./routes/comment.routes.js"

app.use("/api/v1/comments", commentRouter)

//health
import healthRouter from "./routes/healthcheck.routes.js";
app.use("/api/v1/health", healthRouter);


//tweet
import tweetRouter from "./routes/tweet.routes.js";
app.use("/api/v1/tweets", tweetRouter);


import subscriptionRouter from "./routes/subscription.routes.js";

app.use("/api/v1/subscriptions", subscriptionRouter);



//dashboard
import dashboardRouter from "./routes/dashboard.routes.js";

app.use("/api/v1/dashboard", dashboardRouter);


//ai title gen
import aiRouter from "./routes/ai.routes.js";

app.use("/api/v1/ai", aiRouter);















export {app}
