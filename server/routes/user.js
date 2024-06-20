const express = require("express")
const router = express.Router()
const userController = require("../controllers/user")

router.post("/register", userController.user_register, userController.user_login)

router.post("/login", userController.user_login)

router.get("/google/start", userController.user_google_start)

router.get("/google/redirect", userController.user_google_redirect)

router.get("/github/start", userController.user_github_start)

router.get("/github/redirect", userController.user_github_redirect)

router.get("/me", userController.user_check_auth, userController.user_get_me)

router.get("/search", userController.user_check_auth, userController.user_search)

router.put("/", userController.user_check_auth, userController.user_update)

router.delete("/", userController.user_check_auth, userController.user_delete)

module.exports = router
