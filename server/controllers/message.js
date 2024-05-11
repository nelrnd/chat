const Message = require("../models/message")
const Chat = require("../models/chat")
const Image = require("../models/image")
const Link = require("../models/link")
const asyncHandler = require("express-async-handler")
const he = require("he")
const multer = require("multer")

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
    const linksUrl = req.body.content ? req.body.content.split(urlRegex).filter((part) => part.match(urlRegex)) : []

    const images = await Promise.all(
      imagesUrl.map(async (url) => {
        const image = new Image({
          url: url,
          sender: req.user._id,
          chat: req.body.chatId,
        })
        await image.save()
        return image
      })
    )

    const links = await Promise.all(
      linksUrl.map(async (url) => {
        const link = new Link({
          url: url,
          sender: req.user._id,
          chat: req.body.chatId,
        })
        await link.save()
        return link
      })
    )

    let message = new Message({
      content: req.body.content,
      images: imagesUrl,
      chat: req.body.chatId,
      sender: req.user._id,
    })

    await message.save()

    await message.populate({ path: "sender", select: "-password" })

    await message.populate("chat")

    message = JSON.parse(he.decode(JSON.stringify(message)))

    const chat = await Chat.findById(req.body.chatId)
    chat.members.forEach((user) => {
      if (user.toString() !== req.user._id.toString()) {
        chat.unreadCount[user.toString()] += 1
      }
    })
    await Chat.findByIdAndUpdate(req.body.chatId, { unreadCount: chat.unreadCount })

    res.json({ message, links, images })
  }),
]
