const express = require("express")
const Router = express.Router()
const userController = require("../controllers/user")

Router.post("/register", userController.user_register)

Router.post("/login", userController.user_login)

module.exports = Router
