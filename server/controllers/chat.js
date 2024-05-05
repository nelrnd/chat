const chat = require("../models/chat")
const Chat = require("../models/chat")
const Message = require("../models/message")
const asyncHandler = require("express-async-handler")

exports.chat_create = asyncHandler(async (req, res, next) => {
  const members = [req.body.userId, req.user._id]

  if (new Set(members.filter((user) => !!user)).size < 2) {
    return res.status(400).json({ message: "Chat must contains at least 2 members" })
  }

  let chat = new Chat({ members })

  await chat.save()

  await chat.populate({ path: "members", select: "-password" })

  chat = chat.toObject()

  chat.messages = []

  res.json(chat)
})

exports.chat_get_list = asyncHandler(async (req, res, next) => {
  const chats = await Chat.find({ members: req.user._id }).populate({ path: "members", select: "-password" }).lean()

  const messages = await Promise.all(chats.map(async (currChat) => await Message.find({ chat: currChat._id }).lean()))

  const chatsWithMessages = chats.map((chat, id) => ({ ...chat, messages: messages[id] }))

  res.json(chatsWithMessages)
})
