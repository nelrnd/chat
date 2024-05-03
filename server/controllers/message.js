const Message = require("../models/message")
const asyncHandler = require("express-async-handler")
const { body, validationResult } = require("express-validator")
const he = require("he")

exports.message_create = [
  body("content").notEmpty().withMessage("Message is required").escape(),
  asyncHandler(async (req, res, next) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
      return res.status(400).json({ message: result.array()[0].msg })
    }

    let message = new Message({
      content: req.body.content,
      sender: req.user._id,
    })

    await message.save()

    await message.populate({ path: "sender", select: "-password" })

    message = JSON.parse(he.decode(JSON.stringify(message)))

    res.json(message)
  }),
]

exports.message_get_list = asyncHandler(async (req, res, next) => {
  let messages = await Message.find().sort({ timestamp: 1 }).populate({ path: "sender", select: "-password" })

  messages = JSON.parse(he.decode(JSON.stringify(messages)))

  res.json(messages)
})