const chatService = require("../services/chat")
const asyncHandler = require("express-async-handler")
const { multerUpload } = require("../storage")

const upload = multerUpload("media/groups")

exports.createChat = asyncHandler(async (req, res) => {
  const { title, desc, members } = req.body
  const chat = await chatService.createChat({
    title,
    desc,
    members,
    admin: req.user._id,
    authUserId: req.user._id,
    io: req.io,
  })
  res.json(chat)
})

exports.updateChat = [
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const { chatId } = req.params
    const { title, desc, image } = req.body
    const chat = await chatService.updateChat(chatId, req.user._id, title, desc, req.file, image, req.io)
    res.json(chat)
  }),
]

exports.getChatList = asyncHandler(async (req, res) => {
  const chats = await chatService.getChatList(req.user._id)
  res.json(chats)
})

exports.readChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params
  await chatService.readChat(req.user._id, chatId)
  res.json({ message: "Chat read successfully" })
})
