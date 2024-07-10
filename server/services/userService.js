const User = require("../models/user")
const Chat = require("../models/chat")
const Message = require("../models/message")
const { findSocket } = require("../utils")
const chatService = require("./chatService")
const { createMessage } = require("./messageService")
/*
async function addUserToGlobalChat(userId, io) {
  const CREATOR_USER_ID = process.env.CREATOR_USER_ID

  if (CREATOR_USER_ID) {
    let globalChat = await Chat.findOne({ title: "Global chat", admin: CREATOR_USER_ID })
    if (globalChat) {
      await Chat.findByIdAndUpdate(globalChat._id, { $push: { members: userId } })
    } else {
      globalChat = await createGlobalChat(io) // new user will automatically be added
    }

    const socket = findSocket(io, userId)

    if (socket) {
      socket.join(globalChat._id.toString())
      io.to(globalChat._id.toString()).emit("new-chat", globalChat)
    }
  }

  return Promise.resolve()
}
*/
async function addUserToGlobalChat(userId, io) {
  const CREATOR_USER_ID = process.env.CREATOR_USER_ID

  if (!CREATOR_USER_ID) return null

  let globalChat = await Chat.findOne({ title: "Global chat", admin: CREATOR_USER_ID })
  if (!globalChat) {
    globalChat = await chatService.createGlobalChat(io)
  } else {
    chatService.addUserToChat(globalChat._id.toString(), userId)
  }

  return Promise.resolve()
}

async function greetUser(userId, io) {
  const user = await User.findById(userId)

  if (!user) {
    throw new Error("User not found")
  }

  const text = `Hi ${user.name}! Thank's for trying out my app. You can check my other projects at https://github.com/nelrnd 😁✌️`

  setTimeout(async () => {
    const CREATOR_USER_ID = process.env.CREATOR_USER_ID

    if (CREATOR_USER_ID) {
      const members = [CREATOR_USER_ID, userId]

      let chat = await Chat.findOne({ members: { $size: 2, $all: members } })
      let greetMessage = chat && (await Message.findOne({ chat: chat._id, from: CREATOR_USER_ID, text: text }))

      if (!chat) {
        chat = await chatService.createChat({ members, authUserId: CREATOR_USER_ID, io })
      }

      if (!greetMessage) {
        greetMessage = await createMessage({
          chatId: chat._id.toString(),
          authUserId: CREATOR_USER_ID,
          text,
          files: [],
          io,
        })
      }

      /*
      const sockets = chat.members
        .map((member) => findSocket(io, member.toString()))
        .filter((socket) => socket !== undefined)
      sockets.forEach((socket) => socket.join(chat._id.toString()))
      io.to(chat._id.toString()).emit("new-message", greetMessage)
      */
    }
  }, 4000)
}

async function handleUserRegister(userId, io) {
  await addUserToGlobalChat(userId, io)
  greetUser(userId, io)
}

module.exports = {
  handleUserRegister,
}
