import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema=new Schema({
   username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true   //searching kar shkte hai isse(database searching ke lie from mongo)soch smjhkar rakhna
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            
           match: [/.+\@.+\..+/, "Please use a valid email"]
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        avatarPublicId: {
    type: String
},
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [  // from here videomodels is connected
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String, //to decrypt encrypt it (safety)
            required: [true, 'Password is required'] //custo error mess
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)


//this is a middleware hooks used to encrypt the password cause direct encryption nhi ho paati hai,(for eg bf4 login/saving things we wanna decrypt the password)
    // User.create()
    //     ↓
    // pre save middleware
    //     ↓
    // bcrypt.hash()
    //     ↓
    // password encrypted
    //     ↓
    // save to database
    //Database me document save hone se pehle ye function run hoga.
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return

    this.password = await bcrypt.hash(this.password, 10)
})

//after calling methods as a func we can make our own method,and also bcrypt along with encrytion, also can check for password,CRYPTOGRAPHY HAI =>TIME LAGEGA SO ASYNC AWAIT
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

//JWT

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User= mongoose.model("User",userSchema)