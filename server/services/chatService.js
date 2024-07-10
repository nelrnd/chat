const Chat = require("../models/chat")
const User = require("../models/user")
const Message = require("../models/message")
const messageService = require("../services/messageService")
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

  if (!CREATOR_USER_ID) return null

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

  await messageService.createMessage({
    chatId: globalChat._id.toString(),
    authUserId: CREATOR_USER_ID,
    text: "Welcome to the global chat!",
    files: [],
    io,
  })

  return globalChat
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

async function addUserToChat(chatId, userId) {
  const [chat, user] = await Promise.all([Chat.findById(chatId), User.findById(userId)])

  if (!chat) {
    throw new Error(`Chat with id ${chatId} not found`)
  }

  if (!user) {
    throw new Error(`User with id ${userId} not found`)
  }

  if (chat.members.includes(user._id.toString())) {
    throw new Error(`User is already a member of the chat`)
  }

  chat.members.push(user._id.toString())
  chat.markModified("members")
  chat.lastViewed[user._id.toString()] = new Date(0)
  chat.markModified("lastViewed")

  await chat.save()

  return chat
}

async function removeUserFromChat(chatId, userId) {
  const [chat, user] = await Promise.all([Chat.findById(chatId), User.findById(userId)])

  if (!chat) {
    // throw error
    console.log("error")
  }

  if (!user) {
    // throw error
    console.log("error")
  }

  chat.members.splice(
    chat.members.findIndex((member) => member._id === userId),
    1
  )
  delete chat.lastViewed[user._id.toString()]
  // mark lastViewed as changed probably

  await chat.save()

  return chat
}

module.exports = { createChat, createGlobalChat, getChatList, readChat, addUserToChat, removeUserFromChat }
