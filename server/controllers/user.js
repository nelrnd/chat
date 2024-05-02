const User = require("../models/user")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.user_register = asyncHandler(async (req, res, next) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 12)

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  })

  await user.save()

  res.json({ message: "User created successfully" })
})

exports.user_login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" })
  }
  const match = bcrypt.compareSync(req.body.password, user.password)
  if (!match) {
    return res.status(400).json({ message: "Invalid email or password" })
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
  res.json({ message: "User logged in successfully", token })
})

exports.user_check_auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Not authorized, token not found" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: "Not authorized: invalid token" })
  }
})

exports.user_get_me = asyncHandler(async (req, res, next) => {
  // user is from user_check_auth
  const user = req.user

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  res.json(user)
})
