const Chat = require("../models/chat")
const Message = require("../models/message")
const Image = require("../models/image")
const Link = require("../models/link")
const asyncHandler = require("express-async-handler")
const he = require("he")

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
  chat.typingUsers = []
  chat.sharedImages = []
  chat.sharedLinks = []

  res.json(chat)
})

exports.chat_get_list = asyncHandler(async (req, res, next) => {
  let chats = await Chat.find({ members: req.user._id }).populate({ path: "members", select: "-password" }).lean()

  const chatIds = chats.map((chat) => chat._id)

  const [messages, images, links] = await Promise.all([
    Message.find({ chat: { $in: chatIds } })
      .populate({ path: "sender", select: "-password" })
      .lean(),
    Image.find({ chat: { $in: chatIds } })
      .populate({ path: "sender", select: "-password" })
      .lean(),
    Link.find({ chat: { $in: chatIds } })
      .populate({ path: "sender", select: "-password" })
      .lean(),
  ])

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
