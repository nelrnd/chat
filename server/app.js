require("dotenv").config()
const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
const mongoose = require("mongoose")

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// connect to db
const mongoDb = process.env.MONGODB_URL
const main = async () => mongoose.connect(mongoDb)
main().catch((err) => console.log(err))

io.on("connection", (socket) => {
  console.log("a user connected")
})

app.get("/", (req, res) => res.send("Hello"))

const userRouter = require("./routes/user")
app.use("/api/user", userRouter)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
