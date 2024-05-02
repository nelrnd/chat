const express = require("express")
const router = express.Router()
const messageController = require("../controllers/message")
const userController = require("../controllers/user")

router.post("/", userController.user_check_auth, messageController.message_create)

router.get("/", userController.user_check_auth, messageController.message_get_list)

module.exports = router
