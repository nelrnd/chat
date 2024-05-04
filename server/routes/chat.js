const express = require("express")
const router = express.Router()
const chatController = require("../controllers/chat")
const userController = require("../controllers/user")

router.post("/", userController.user_check_auth, chatController.chat_create)

router.get("/", userController.user_check_auth, chatController.chat_get_list)

module.exports = router
