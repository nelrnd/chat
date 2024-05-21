const Chat = require("../models/chat")
const Message = require("../models/message")
const Image = require("../models/image")
const Link = require("../models/link")
const asyncHandler = require("express-async-handler")
const he = require("he")
const { findSocket } = require("../utils")

exports.chat_create = asyncHandler(async (req, res, next) => {
  if (Array.from(new Set(req.body.members)).length < 2) {
    return res.status(400).json({ message: "Chat must contain at least 2 members" })
  }

  if (!req.body.members.includes(req.user._id.toString())) {
    return res.status(400).json({ message: "Chat must contain auth user" })
  }

  const unreadCount = {}
  req.body.members.forEach((user) => (unreadCount[user] = 0))
  let chat = new Chat({ members: req.body.members, unreadCount })
  await chat.save()
  await chat.populate({ path: "members", select: "-password" })
  chat = chat.toObject()
  chat = { ...chat, messages: [], typingUsers: [], sharedImages: [], sharedLinks: [] }

  const io = req.io
  chat.members.forEach((user) => {
    const socket = findSocket(io, user._id.toString())
    if (socket) {
      socket.join(chat._id.toString())
      if (user._id.toString() !== req.user._id.toString()) {
        io.to(user._id.toString()).emit("new-chat", chat)
      }
    }
  })

  res.json(chat)
})

exports.chat_get_list = asyncHandler(async (req, res, next) => {
  let chats = await Chat.find({ members: req.user._id }).populate({ path: "members", select: "-password" }).lean()

  const chatIds = chats.map((chat) => chat._id)

  const [messages, images, links] = await Promise.all([
    Message.find({ chat: { $in: chatIds } })
      .populate({ path: "images", populate: { path: "sender", select: "-password" } })
      .populate({ path: "sender", select: "-password" })
      .lean(),
    Image.find({ chat: { $in: chatIds } })
      .populate({ path: "sender", select: "-password" })
      .lean(),
    Link.find({ chat: { $in: chatIds } })
      .populate({ path: "sender", select: "-password" })
      .lean(),
  ])

  console.log(messages)

  const messagesMap = messages.reduce((map, message) => {
    map[message.chat.toString()] = map[message.chat.toString()] || []
    map[message.chat.toString()].push(message)
    return map
  }, {})

  const imagesMap = images.reduce((map, image) => {
    map[image.chat.toString()] = map[image.chat.toString()] || []
    map[image.chat.toString()].push(image)
    return map
  }, {})

  const linksMap = links.reduce((map, link) => {
    map[link.chat.toString()] = map[link.chat.toString()] || []
    map[link.chat.toString()].push(link)
    return map
  }, {})

  chats = chats.map((chat) => ({
    ...chat,
    messages: messagesMap[chat._id.toString()] || [],
    typingUsers: [],
    sharedImages: imagesMap[chat._id.toString()] || [],
    sharedLinks: linksMap[chat._id.toString()] || [],
  }))

  res.json(chats)
})

exports.chat_check_auth = asyncHandler(async (req, res, next) => {
  const chat = await Chat.findById(req.body.chatId)

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" })
  }

  if (!chat.members.includes(req.user._id)) {
    return res.status(401).json({ message: "Not authorized: user not in chat" })
  }

  next()
})

exports.chat_read = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params
  const { unreadCount } = await Chat.findById(chatId)
  unreadCount[req.user._id.toString()] = 0
  await Chat.findByIdAndUpdate(chatId, { unreadCount })
  res.end()
})
