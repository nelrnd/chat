const Message = require("../models/message")
const Media = require("../models/media")
const he = require("he")

async function createImages(files, chatId, authUserId) {
  if (files.length === 0) {
    return []
  }

  const images = await Promise.all(
    files.map(async (file) => {
      const url = file.path
      const image = new Media({ type: "image", url, from: authUserId, chat: chatId })
      await image.save()
      await image.populate({ path: "from", select: "-password" })
      return image
    })
  )

  return images
}

async function createLinks(text, chatId, authUserId) {
  if (typeof text !== "string" || text === "") {
    return []
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = text.split(urlRegex).filter((part) => part.match(urlRegex))

  const links = await Promise.all(
    urls.map(async (url) => {
      const link = new Media({ type: "link", url, from: authUserId, chat: chatId })
      await link.save()
      await link.populate({ path: "from", select: "-password" })
      return link
    })
  )

  return links
}

async function createMessage({ chatId, authUserId, text, files, game, io }) {
  let message, images, links

  if (game) {
    message = new Message({ type: "game", game, from: authUserId, chat: chatId })
  } else {
    if (!text && !files.length) {
      const error = new Error("Message cannot be empty")
      error.status = 400
      throw error
    }

    ;[images, links] = await Promise.all([
      createImages(files, chatId, authUserId),
      createLinks(text, chatId, authUserId),
    ])

    message = new Message({ type: "normal", text, images, links, from: authUserId, chat: chatId })
  }

  await message.save()
  await message.populate({ path: "from", select: "-password" })
  if (message.type === "game")
    await message.populate({ path: "game", populate: { path: "players", select: "-password" } })

  decodedMessage = JSON.parse(he.decode(JSON.stringify(message)))

  const res = { message: decodedMessage, images, links }

  emitNewMessage(res, authUserId, chatId, io)

  return res
}

function emitNewMessage(message, authUserId, chatId, io) {
  console.log(io.sockets.sockets[0].rooms)
  io.to(chatId).except(authUserId).emit("new-message", message)
}

module.exports = { createMessage }
