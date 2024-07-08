const Chat = require("../models/chat")
const Message = require("../models/message")
const { findSocket } = require("../utils")
const { createGlobalChat, createChat } = require("./chatService")

async function addUserToGlobalChat(userId, io) {
  const CREATOR_USER_ID = process.env.CREATOR_USER_ID

  if (CREATOR_USER_ID) {
    let globalChat = await Chat.findOne({ title: "Global Chat", admin: CREATOR_USER_ID })
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

function greetUser(userId, io) {
  const messageText =
    "Hi, I'm Nel! Thank's for trying out my chat app. You can check out my other projects at https://nel.dev 😁✌️💜"

  setTimeout(async () => {
    const CREATOR_USER_ID = process.env.CREATOR_USER_ID

    if (CREATOR_USER_ID) {
      const members = [CREATOR_USER_ID, userId]

      let chat = await Chat.findOne({ members: { $size: 2, $all: members } })
      let greetMessage = chat && (await Message.findOne({ chat: chat._id, from: CREATOR_USER_ID, text: messageText }))

      if (!chat) {
        chat = await createChat({ members, authUserId: CREATOR_USER_ID, io })
      }

      if (!greetMessage) {
        greetMessage = new Message({
          type: "normal",
          text: messageText,
          from: CREATOR_USER_ID,
          chat: chat._id,
        })
        await greetMessage.save()
      }

      const sockets = chat.members
        .map((member) => findSocket(io, member.toString()))
        .filter((socket) => socket !== undefined)
      sockets.forEach((socket) => socket.join(chat._id.toString()))
      io.to(chat._id.toString()).emit("new-message", { message: greetMessage })
    }
  }, 5000)
}

module.exports = {
  addUserToGlobalChat,
  greetUser,
}
