const Message = require("../models/message")
const Chat = require("../models/chat")
const Media = require("../models/media")
const asyncHandler = require("express-async-handler")
const he = require("he")
const { multerUpload } = require("../storage")
const { findSocket } = require("../utils")

const upload = multerUpload("media/images")

async function createImages(req) {
  if (req.files.length === 0) {
    return []
  }

  const images = await Promise.all(
    req.files.map(async (file) => {
      const url = file.path
      const image = new Media({ type: "image", url, from: req.user._id, chat: req.body.chatId })
      await image.save()
      await image.populate({ path: "from", select: "-password" })
      return image
    })
  )

  return images
}

async function createLinks(req) {
  if (typeof req.body.text !== "string" || req.body.text === "") {
    return []
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = req.body.text.split(urlRegex).filter((part) => part.match(urlRegex))

  const links = await Promise.all(
    urls.map(async (url) => {
      const link = new Media({ type: "link", url, from: req.user._id, chat: req.body.chatId })
      await link.save()
      await link.populate({ path: "from", select: "-password" })
      return link
    })
  )

  return links
}

exports.message_create = [
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    let message, images, links

    if (req.game) {
      message = new Message({
        type: "game",
        game: req.game,
        from: req.user._id,
        chat: req.body.chatId,
      })
    } else {
      if (!req.body.text && !req.files.length) {
        return res.status(400).json({ message: "Message cannot be empty" })
      }

      ;[images, links] = await Promise.all([createImages(req), createLinks(req)])

      message = new Message({
        type: "normal",
        text: req.body.text,
        images,
        links,
        from: req.user._id,
        chat: req.body.chatId,
      })
    }

    await message.save()
    await message.populate({ path: "from", select: "-password" })
    if (message.type === "game") {
      await message.populate({ path: "game", populate: { path: "players", select: "-password" } })
    }

    message = JSON.parse(he.decode(JSON.stringify(message)))

    const socket = findSocket(req.io, req.user._id.toString())

    if (socket) {
      socket.to(req.body.chatId).emit("new-message", { message, links, images })
    }

    res.json({ message, links, images })
  }),
]
