const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

io.on("connection", (socket) => {
  console.log("a user connected")
})

app.get("/", (req, res) => res.send("Hello"))

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
