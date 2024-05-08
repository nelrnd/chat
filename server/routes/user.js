const express = require("express")
const router = express.Router()
const userController = require("../controllers/user")

router.post("/register", userController.user_register)

router.post("/login", userController.user_login)

router.get("/me", userController.user_check_auth, userController.user_get_me)

router.get("/search", userController.user_check_auth, userController.user_search)

router.put("/", userController.user_check_auth, userController.user_update)

router.delete("/", userController.user_check_auth, userController.user_delete)

module.exports = router
