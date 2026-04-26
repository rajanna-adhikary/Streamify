import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})









// 1️⃣ The Real Problem: Express Cannot Read File Uploads

// When a client uploads a file, the request looks like this:

// POST /upload
// Content-Type: multipart/form-data

// Inside the request body:

// ------boundary
// Content-Disposition: form-data; name="video"; filename="video.mp4"
// Content-Type: video/mp4

// (binary file data)
// ------boundary

// Express cannot parse this automatically.

// It only understands:

// application/json
// application/x-www-form-urlencoded

// So if someone uploads a file:

// console.log(req.body)

// You will get:

// {}

// No file.

// 2️⃣ Multer’s Actual Job

// Multer parses multipart/form-data and extracts the file.

// So after multer runs:

// req.file

// becomes available.

// Example:

// req.file = {
//   originalname: "video.mp4",
//   mimetype: "video/mp4",
//   size: 234234,
//   path: "public/temp/video.mp4"
// }

// Without multer:

// req.file = undefined

// So the backend cannot access the uploaded file at all.