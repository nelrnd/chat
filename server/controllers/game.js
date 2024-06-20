const Game = require("../models/game")
const Chat = require("../models/chat")
const asyncHandler = require("express-async-handler")

exports.game_create = asyncHandler(async (req, res, next) => {
  const { io } = req
  const { chatId, createdBy } = req.body
  const chat = await Chat.findById(chatId)

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" })
  }
  if (chat.members.length > 2) {
    return res.status(400).json({ message: "Game cannot be created on group chats" })
  }

  const firstTurn = chat.members.findIndex((userId) => userId.toString() !== createdBy)

  const game = new Game({
    chat: chatId,
    players: chat.members,
    scores: { ...chat.members.reduce((acc, curr) => ({ ...acc, [curr._id]: 0 }), {}), draws: 0 },
    createdBy,
    startTurn: firstTurn,
    turn: firstTurn,
  })

  await game.save()
  await game.populate({ path: "players", select: "-password" })

  /*
  io.to(chatId).emit("new-game", game)
  res.json({ game })
  */

  req.game = game._id.toString()

  next()
})

exports.game_start = asyncHandler(async (req, res) => {
  const { io } = req
  const { gameId } = req.params
  const game = await Game.findById(gameId)

  game.status = "running"

  await game.save()
  await game.populate({ path: "players", select: "-password" })

  io.to(game.chat.toString()).emit("game-start", game)
  res.json({ game })
})

exports.game_play = asyncHandler(async (req, res) => {
  const { io } = req
  const { gameId } = req.params
  const { index } = req.body
  const userId = req.user._id.toString()
  const game = await Game.findById(gameId).populate({ path: "players", select: "-password" })

  if (!game) {
    return res.status(404).json({ message: "Game not found" })
  }
  if (game.board[index] !== null) {
    return res.status(400).json({ message: "Square already taken" })
  }
  if (game.players[game.turn]._id.toString() !== userId) {
    return res.status(400).json({ message: "Not your turn yet" })
  }

  game.board[index] = game.turn

  if (game.win) {
    game.incrementScores(game.win.player._id)
    io.to(game.chat.toString()).emit("game-win", { ...game.win, id: game._id.toString() })
    setTimeout(() => {
      game.end()
      io.to(game.chat.toString()).emit("game-update")
    }, 2000)
  }

  if (game.draw) {
    game.incrementScores("draws")
    io.to(game.chat.toString()).emit("game-draw")
    setTimeout(() => {
      game.end()
      io.to(game.chat.toString()).emit("game-update")
    }, 2000)
  }

  await game.switchTurn()
  await game.save()

  io.to(game.chat.toString()).emit("game-update", game)
  res.json({ game })
})
