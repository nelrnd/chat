const Message = require("../models/message")
const asyncHandler = require("express-async-handler")
const { body, validationResult } = require("express-validator")

exports.message_create = [
  body("content").notEmpty().withMessage("Message is required").escape(),
  asyncHandler(async (req, res, next) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
      return res.status(400).json({ message: result.array()[0].msg })
    }

    const message = new Message({
      content: req.body.content,
      sender: req.user._id,
    })

    await message.save()

    res.json(message)
  }),
]

exports.message_get_list = asyncHandler(async (req, res, next) => {
  const messages = await Message.find().sort({ timestamp: 1 }).populate({ path: "sender", select: "-password" })

  res.json(messages)
})
