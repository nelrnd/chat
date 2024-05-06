require("dotenv").config()
const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, { cors: { origin: "http://localhost:5173" } })
const mongoose = require("mongoose")
const cors = require("cors")

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

// connect to db
const mongoDb = process.env.MONGODB_URL
const main = async () => mongoose.connect(mongoDb)
main().catch((err) => console.log(err))

const Chat = require("./models/chat")

io.on("connection", (socket) => {
  let userId

  socket.on("login", async (newUserId) => {
    userId = newUserId
    // connect to all chat rooms user is in
    const chats = await Chat.find({ members: userId })
    chats.forEach((chat) => {
      socket.join(chat._id.toString())
      console.log("socket joined room ", chat._id.toString())
    })
  })

  socket.on("disconnect", () => {
    console.log("a user disconnected")
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
