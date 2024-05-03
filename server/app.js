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

io.on("connection", (socket) => {
  console.log("a user connected")

  socket.on("disconnect", () => {
    console.log("a user disconnected")
  })
})

app.get("/", (req, res) => res.send("Hello"))

const userRouter = require("./routes/user")
const messageRouter = require("./routes/message")
app.use("/api/user", userRouter)
app.use("/api/message", messageRouter)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
