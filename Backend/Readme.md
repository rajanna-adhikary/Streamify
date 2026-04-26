# This is readme.md
## Very imp to understand the flow of request between backend files and receiving response
1️⃣ User Sends Request

Example: frontend sends request

POST /api/v1/users/register

This request goes to your Node server.

2️⃣ Request Reaches index.js

Your index.js starts the server.

Example:

connectDB().then(()=>{
    app.listen(PORT)
})

Now the server is ready to accept requests.

3️⃣ Request Enters app.js

In app.js you configured middleware:

app.use(cors())
app.use(express.json())
app.use(cookieParser())

So every request first passes through these.

Flow:

Request
  ↓
CORS check
  ↓
JSON parser
  ↓
Cookie parser
4️⃣ Router Handles the Path

Inside app.js you attach routers.

Example:

import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users", userRouter)

So Express checks:

Does request start with /api/v1/users ?

Yes → send it to userRouter.

5️⃣ Router Finds the Correct Route

Inside user.routes.js:

router.post("/register", registerUser)

So router matches:

/api/v1/users/register

Then it runs the controller:

registerUser
6️⃣ Middleware Can Run Before Controller

Example:

router.post(
  "/upload-avatar",
  upload.single("avatar"),
  verifyJWT,
  uploadAvatar
)

Flow becomes:

Request
  ↓
upload.single()
  ↓
verifyJWT
  ↓
controller

Each middleware decides whether request continues.

7️⃣ Controller Runs

Controller example:

const registerUser = asyncHandler(async (req,res)=>{
   const user = await User.create({...})
   res.status(201).json(user)
})

Controller does:

business logic
database queries
response creation
8️⃣ Database Interaction

Example:

await User.create({...})

This talks to MongoDB.

Flow:

Controller
  ↓
Mongoose
  ↓
MongoDB
9️⃣ Response Sent Back

Controller sends response:

res.status(201).json({
   message: "User registered"
})

Then Express sends it back to client.

Server → Client
🔟 Complete Flow Diagram
Client
   ↓
index.js (server running)
   ↓
app.js
   ↓
Global middleware
   ↓
Router
   ↓
Route middleware
   ↓
Controller
   ↓
Database
   ↓
Controller response
   ↓
Client
Real Example From Your Project

Request:

POST /api/v1/users/register

Full flow:

Client
 ↓
index.js
 ↓
app.js
 ↓
userRouter
 ↓
asyncHandler
 ↓
registerUser controller
 ↓
User model
 ↓
MongoDB
 ↓
ApiResponse
 ↓
Client
Why Understanding This Matters

When debugging, you know where problem is.

Example:

Problem	Possible location
CORS error	app.js
Route not found	router
Authentication failed	middleware
DB error	controller / model
One Last Insight

Every Express backend basically follows this same pipeline:

Middleware → Router → Controller → Service → Database → Response