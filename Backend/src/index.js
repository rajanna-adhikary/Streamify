import dotenv from "dotenv"
//import mongoose from "mongoose"
//kabhi bhi db ek line m connect nhi karna chahiye
//import {DB_NAME} from "./constants";

import connectDB from "./db/index.js"   //IMPORT KIA CONNECTDB (DB NAME )FROM =D:\First_Project\src\db\index.js  AND THEN WE ARE CALLING IT
/*
import express from "express";
const app=express()
(async()=>{
    try{
           await  mongoose.connection(`${process.env.MONGODB_URI}/${DB_NAME}`  )
            //db run but express baat nhi kar paa raha hai
            app.on("error",(error)=>{
                console.log("ERR:",error)
                throw error
            })
            app.listen(process.env.PORT,()=>{
                console.log(`app is listening on ${process.env.PORT}`)
            })
    }
    
    catch(error){
        console.error("ERROR",error)
        throw error
    }
})()  */
//UPER WALA WAS ONE OF THE APPROACH
import {app} from './app.js'
dotenv.config({
    path: "./.env"
})

connectDB()
//async promise return krta toh we will handle it like this
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`)
    })
})
.catch((err) => {
    console.log("MongoDB connection failed:", err)
})