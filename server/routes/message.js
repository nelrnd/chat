const express = require("express")
const router = express.Router()
const messageController = require("../controllers/message")
const userController = require("../controllers/user")

router.post("/", userController.user_check_auth, messageController.createMessage)

module.exports = router
