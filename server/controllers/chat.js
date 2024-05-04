const Chat = require("../models/chat")
const asyncHandler = require("express-async-handler")

exports.chat_create = asyncHandler(async (req, res, next) => {
  const members = [req.body.userId, req.user._id]

  if (new Set(members.filter((user) => !!user)).size < 2) {
    return res.status(400).json({ message: "Chat must contains at least 2 members" })
  }

  const chat = new Chat({ members })

  await chat.save()

  await chat.populate({ path: "members", select: "-password" })

  res.json(chat)
})

exports.chat_get_list = asyncHandler(async (req, res, next) => {
  const chats = await Chat.find({ members: req.user._id }).populate({ path: "members", select: "-password" })

  res.json(chats)
})
