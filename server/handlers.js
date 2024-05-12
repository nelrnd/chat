const User = require("./models/user")
const Chat = require("./models/chat")

exports.handleLogin = async function (userId) {
  const socket = this
  socket.join(userId)
  socket.userId = userId
  await User.findByIdAndUpdate(userId, { isOnline: true })
  const chats = await Chat.find({ members: userId })
  chats.forEach((chat) => {
    const chatId = chat._id.toString()
    socket.join(chatId)
    socket.to(chatId).emit("user-connection", userId)
  })
}

exports.handleStartTyping = async function (chatId) {
  const socket = this
  socket.to(chatId).emit("start-typing", { userId: socket.userId, chatId })
}

exports.handleStopTyping = async function (chatId) {
  const socket = this
  socket.to(chatId).emit("stop-typing", { userId: socket.userId, chatId })
}

exports.handleDisconnect = async function () {
  const socket = this
  await User.findByIdAndUpdate(socket.userId, { isOnline: false })
  const chats = await Chat.find({ members: socket.userId })
  chats.forEach((chat) => {
    const chatId = chat._id.toString()
    socket.leave(chatId)
    socket.to(chatId).emit("user-disconnection", socket.userId)
  })
}
