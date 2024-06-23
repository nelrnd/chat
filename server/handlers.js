const User = require("./models/user")
const Chat = require("./models/chat")
const Game = require("./models/game")
const Message = require("./models/message")

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

  // delete waiting games when both players are offline
  const waitingGames = await Game.find({ players: socket.userId, status: "waiting" }).populate({ path: "players" })
  const offlineWaitingGames = waitingGames.filter((game) => game.players.every((player) => player.isOnline === false))
  await Game.deleteMany({ _id: { $in: offlineWaitingGames.map((game) => game._id) } })
  await Message.deleteMany({ game: { $in: offlineWaitingGames.map((game) => game._id) } })

  // update game status from running to over when both players are offline
  const runningGames = await Game.find({ players: socket.userId, status: "running" })
  const offlineRunningGames = runningGames.filter((game) => game.players.every((player) => player.isOnline === false))
  await Game.updateMany({ _id: { $in: offlineRunningGames.map((game) => game._id) } }, { status: "over" })
}
