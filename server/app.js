require("dotenv").config()
const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, { cors: { origin: process.env.CLIENT_BASE_URL } })
const mongoose = require("mongoose")
const cors = require("cors")
const passport = require("passport")

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
)
app.use(passport.initialize())

app.use("/media/avatars", express.static("media/avatars"))

// connect to db
const mongoDb = process.env.MONGODB_URL
const main = async () => mongoose.connect(mongoDb)
main().catch((err) => console.log(err))

const User = require("./models/user")
const Chat = require("./models/chat")

io.on("connection", (socket) => {
  let userId

  socket.on("login", async (newUserId) => {
    userId = newUserId
    socket.join(userId)
    socket.userId = userId

    await User.findByIdAndUpdate(userId, { isOnline: true })

    const chats = await Chat.find({ members: userId })
    chats.forEach((chat) => {
      socket.join(chat._id.toString())
      socket.to(chat._id.toString()).emit("user connected", userId)
    })
  })

  socket.on("disconnect", async () => {
    if (userId) {
      await User.findByIdAndUpdate(userId, { isOnline: false })

      const chats = await Chat.find({ members: userId })
      chats.forEach((chat) => {
        socket.leave(chat._id.toString())
        socket.to(chat._id.toString()).emit("user disconnected", userId)
      })
    }
  })

  socket.on("new chat", (chat) => {
    socket.join(chat._id)
    chat.members.forEach((user) => {
      if (user._id !== userId) {
        socket.to(user._id).emit("new chat", chat)
      }
    })
  })

  socket.on("join chat", (chat) => {
    socket.join(chat._id)
  })

  socket.on("new message", (msg) => {
    socket.to(msg.chat._id).emit("new message", msg)
  })

  socket.on("started typing", (userName, chatId) => {
    socket.to(chatId).emit("started typing", userName, chatId)
  })

  socket.on("stopped typing", (userName, chatId) => {
    socket.to(chatId).emit("stopped typing", userName, chatId)
  })
})

app.get("/", (req, res) => res.send("Hello"))

const userRouter = require("./routes/user")
const messageRouter = require("./routes/message")
const chatRouter = require("./routes/chat")
app.use("/api/user", userRouter)
app.use("/api/message", messageRouter)
app.use("/api/chat", chatRouter)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
