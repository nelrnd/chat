const Message = require("../models/message")
const Chat = require("../models/chat")
const Image = require("../models/image")
const Link = require("../models/link")
const asyncHandler = require("express-async-handler")
const he = require("he")
const multer = require("multer")
const { findSocket } = require("../utils")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/images")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + "-" + file.originalname)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, cb) => {
    const mimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!mimeTypes.includes(file.mimetype)) {
      return cb(new Error("file is not allowed"))
    }
    cb(null, true)
  },
})

exports.message_create = [
  upload.array("images", 10),
  asyncHandler(async (req, res, next) => {
    if (!req.body.content && !req.files.length) {
      return res.status(400).json({ message: "Message cannot be empty" })
    }

    const imagesUrl = req.files.length ? req.files.map((img) => img.path) : []
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const linksUrl = (req.body.content || "").split(urlRegex).filter((part) => part.match(urlRegex))

    const createEntity = async (Model, url) => {
      const entity = new Model({
        url,
        sender: req.user._id,
        chat: req.body.chatId,
      })
      await entity.save()
      return entity
    }

    const imagesPromise = Promise.all(imagesUrl.map((url) => createEntity(Image, url)))
    const linksPromise = Promise.all(linksUrl.map((url) => createEntity(Link, url)))

    const [images, links] = await Promise.all([imagesPromise, linksPromise])

    let message = new Message({
      content: req.body.content,
      chat: req.body.chatId,
      images: imagesUrl,
      sender: req.user._id,
    })
    await message.save()
    await message.populate({ path: "sender", select: "-password" })
    message = JSON.parse(he.decode(JSON.stringify(message)))

    // increment unread count
    const { members, unreadCount } = await Chat.findById(req.body.chatId)
    members.forEach((user) => {
      const userId = user.toString()
      if (userId !== req.user._id.toString()) {
        unreadCount[userId]++
      } else {
        unreadCount[userId] = 0
      }
    })
    await Chat.findByIdAndUpdate(req.body.chatId, { unreadCount })

    const io = req.io
    const socket = findSocket(io, req.user._id.toString())

    if (socket) {
      socket.to(req.body.chatId).emit("new-message", { message, links, images })
    }

    res.json({ message, links, images })
  }),
]
