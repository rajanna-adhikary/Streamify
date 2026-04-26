import {v2 as cloudinary} from "cloudinary"
import fs from "fs"  //yeh inbuilt node m file syatem 


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});




const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response; // sync (that is idhr) hum remove kar denge jo bhi files ayi hai( pehle cloudinary m aur humare local server(folder =public m reh rha tha sare media, ab hata di gayi hai to save memory))

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



//for deleting files from db(jab hum update kare pic-avatar/cover)
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null

        const response = await cloudinary.uploader.destroy(publicId)
        return response
    } catch (error) {
        console.log("Error deleting from cloudinary:", error)
        return null
    }
}



export {uploadOnCloudinary,deleteFromCloudinary}


// Frontend upload
//       ↓
// Multer stores file in temp folder
//       ↓
// Cloudinary uploads file
//       ↓
// Server deletes local file
//       ↓
// MongoDB stores Cloudinary URL