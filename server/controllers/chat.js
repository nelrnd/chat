const Chat = require("../models/chat")
const Message = require("../models/message")
const Media = require("../models/media")
const asyncHandler = require("express-async-handler")
const he = require("he")
const { findSocket } = require("../utils")

exports.chat_create = asyncHandler(async (req, res, next) => {
  const members = Array.from(new Set(req.body.members))

  if (members.length < 2) {
    return res.status(400).json({ message: "Chat must contain at least 2 members" })
  }
  if (!members.includes(req.user._id.toString())) {
    return res.status(400).json({ message: "Chat must contain auth user" })
  }

  const lastViewed = members.reduce((acc, curr) => ({ ...acc, [curr]: Date.now() }), {})

  let chat = new Chat({ members, lastViewed })
  await chat.save()
  await chat.populate({ path: "members", select: "-password" })

  const unreadCount = await chat.getUnreadCount(req.user._id)

  chat = JSON.parse(he.decode(JSON.stringify(chat)))

  chat = {
    ...chat,
    type: chat.members.length === 2 ? "private" : "group",
    messages: [],
    images: [],
    links: [],
    typingUsers: [],
    unreadCount,
  }

  const { io } = req
  members.forEach((user) => {
    const socket = findSocket(io, user)
    if (socket) {
      socket.join(chat._id.toString())
      if (user !== req.user._id.toString()) {
        io.to(user).emit("new-chat", chat)
      }
    }
  })

  res.json(chat)
})

exports.chat_get_list = asyncHandler(async (req, res, next) => {
  let chats = await Chat.find({ members: req.user._id }).populate({ path: "members", select: "-password" })

  const chatIds = chats.map((chat) => chat._id.toString())

  const [messages, images, links] = await Promise.all([
    Message.find({ chat: { $in: chatIds } })
      .populate({ path: "images", populate: { path: "from", select: "-password" } })
      .populate({ path: "from", select: "-password" })
      .populate({ path: "game", populate: { path: "from", select: "-password" } })
      .lean(),
    Media.find({ type: "image", chat: { $in: chatIds } })
      .populate({ path: "from", select: "-password" })
      .lean(),
    Media.find({ type: "link", chat: { $in: chatIds } })
      .populate({ path: "from", select: "-password" })
      .lean(),
  ])

  const [messagesMap, imagesMap, linksMap] = [messages, images, links].map((type) =>
    type.reduce((map, item) => {
      map[item.chat.toString()] = map[item.chat.toString()] || []
      map[item.chat.toString()].push(item)
      return map
    }, {})
  )

  let unreadCounts = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await chat.getUnreadCount(req.user._id)
      return { id: chat._id, unreadCount }
    })
  )

  unreadCounts = unreadCounts.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.unreadCount }), {})

  chats = JSON.parse(he.decode(JSON.stringify(chats)))

  chats = chats.map((chat) => ({
    ...chat,
    type: chat.members.length === 2 ? "private" : "group",
    messages: messagesMap[chat._id.toString()] || [],
    images: imagesMap[chat._id.toString()] || [],
    links: linksMap[chat._id.toString()] || [],
    typingUsers: [],
    unreadCount: unreadCounts[chat._id.toString()],
  }))

  res.json(chats)
})

/*
Not used yet
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
*/

exports.chat_read = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString()
  const { chatId } = req.params
  const chat = await Chat.findById(chatId)
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" })
  }
  chat.lastViewed[userId] = Date.now()
  await chat.save()
  res.end()
})
