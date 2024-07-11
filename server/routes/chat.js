const express = require("express")
const router = express.Router()
const chatController = require("../controllers/chat")
const userController = require("../controllers/user")

router.post("/", userController.checkUserAuth, chatController.createChat)
router.get("/", userController.checkUserAuth, chatController.getChatList)
router.put("/:chatId", userController.checkUserAuth, chatController.updateChat)
router.post("/:chatId/read", userController.checkUserAuth, chatController.readChat)

module.exports = router
