const User = require("../models/user")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")

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
    return res.status(401).json({ message: "Invalid email or password" })
  }
  const match = bcrypt.compareSync(req.body.password, user.password)
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password" })
  }
  res.json({ message: "User logged in successfully" })
})
