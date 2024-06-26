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
app.use(cors({ origin: process.env.CLIENT_BASE_URL, methods: "GET,POST,PUT,DELETE" }))
app.use(passport.initialize())
app.use((req, res, next) => {
  req.io = io
  next()
})

app.use("/media/avatars", express.static("media/avatars"))
app.use("/media/images", express.static("media/images"))

// connect to db
const mongoDb = process.env.MONGODB_URL
const main = async () => mongoose.connect(mongoDb)
main().catch((err) => console.log(err))

const handlers = require("./handlers")

io.on("connection", (socket) => {
  socket.on("login", handlers.handleLogin)
  socket.on("start-typing", handlers.handleStartTyping)
  socket.on("stop-typing", handlers.handleStopTyping)
  socket.on("disconnect", handlers.handleDisconnect)
})

const userRouter = require("./routes/user")
const messageRouter = require("./routes/message")
const chatRouter = require("./routes/chat")
const gameRouter = require("./routes/game")
app.use("/api/user", userRouter)
app.use("/api/message", messageRouter)
app.use("/api/chat", chatRouter)
app.use("/api/game", gameRouter)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
