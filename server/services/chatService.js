const Chat = require("../models/chat")
const User = require("../models/user")
const Message = require("../models/message")
const { findSocket } = require("../utils")

async function createChat({ members, title, desc, admin, authUserId, io }) {
  members = Array.from(new Set(members))

  if (members.length < 2) {
    throw new Error({ message: "Chat must contain at least 2 members", code: 400 })
  }

  if (!members.includes(authUserId)) {
    throw new Error({ message: "Chat must contain auth user", code: 400 })
  }

  const lastViewed = members.reduce((acc, curr) => ({ ...acc, [curr]: Date.now() }), {})

  let chat = new Chat({ members, lastViewed, title, desc, admin })
  await chat.save()
  await chat.populate({ path: "members", select: "-password" })

  const unreadCount = await chat.getUnreadCount(authUserId)
  const type = chat.type

  chat = chat.toObject()
  chat.unreadCount = unreadCount
  chat.type = type
  chat.messages = []
  chat.images = []
  chat.links = []
  chat.typingUsers = []

  emitNewChat(chat, authUserId, io)

  return chat
}

async function createGlobalChat(io) {
  const CREATOR_USER_ID = process.env.CREATOR_USER_ID

  if (CREATOR_USER_ID) {
    const users = await User.find({})
    const userIds = users.map((user) => user._id.toString())

    const globalChat = await createChat({
      members: userIds,
      title: "Global chat",
      desc: "Global chat of the app, have fun ;)",
      admin: CREATOR_USER_ID,
      authUserId: CREATOR_USER_ID,
      io,
    })

    const firstMessage = new Message({
      type: "normal",
      text: "Welcome to the global chat!",
      from: CREATOR_USER_ID,
      chat: globalChat._id,
    })
    await firstMessage.save()

    return globalChat
  }
}

function emitNewChat(chat, authUserId, io) {
  chat.members.forEach((member) => {
    const socket = findSocket(io, member._id.toString())
    if (socket) {
      socket.join(chat._id.toString())
      if (member._id.toString() !== authUserId) {
        io.to(member._id.toString()).emit("new-chat", chat)
      }
    }
  })
}

async function getChatList(authUserId) {
  let chats = await Chat.find({ members: authUserId }).populate({ path: "members", select: "-password" })

  const chatIds = chats.map((chat) => chat._id.toString())
}

async function readChat(authUserId, chatId) {
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $set: { [`lastViewed.${authUserId}`]: Date.now() } },
    { new: true }
  )
  if (!chat) {
    throw new Error({ message: "Chat not found", status: 404 })
  }
  return chat
}

module.exports = { createChat, createGlobalChat, getChatList, readChat }
