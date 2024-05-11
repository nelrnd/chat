const Message = require("../models/message")
const asyncHandler = require("express-async-handler")
const { body, validationResult } = require("express-validator")
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
  body("content").notEmpty().withMessage("Message is required").escape(),
  asyncHandler(async (req, res, next) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
      return res.status(400).json({ message: result.array()[0].msg })
    }

    const images = req.files.length ? req.files.map((img) => img.path) : []

    let message = new Message({
      content: req.body.content,
      images,
      chat: req.body.chatId,
      sender: req.user._id,
    })

    await message.save()

    await message.populate({ path: "sender", select: "-password" })

    await message.populate("chat")

    message = JSON.parse(he.decode(JSON.stringify(message)))

    res.json(message)
  }),
]

exports.message_get_list = asyncHandler(async (req, res, next) => {
  let messages = await Message.find().sort({ timestamp: 1 }).populate({ path: "sender", select: "-password" })

  messages = JSON.parse(he.decode(JSON.stringify(messages)))

  res.json(messages)
})
