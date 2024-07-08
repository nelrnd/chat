const express = require("express")
const router = express.Router()
const gameController = require("../controllers/game")
const messageController = require("../controllers/message")
const userController = require("../controllers/user")

router.post("/", userController.user_check_auth, gameController.game_create, messageController.createMessage)

router.post("/:gameId/start", userController.user_check_auth, gameController.game_start)

router.post("/:gameId/play", userController.user_check_auth, gameController.game_play)

module.exports = router
