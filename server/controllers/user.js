const User = require("../models/user")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")

exports.user_register = [
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await User.findOne({ email: value })
      if (user) {
        throw new Error("Email already in use")
      }
    })
    .escape(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
      return res.status(400).json({ message: result.array()[0].msg })
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 12)

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    })

    await user.save()

    res.json({ message: "User created successfully" })
  }),
]

exports.user_login = [
  body("email").trim().notEmpty().withMessage("Email is required").escape(),
  body("password").trim().notEmpty().withMessage("Password is required").escape(),
  asyncHandler(async (req, res, next) => {
    const results = validationResult(req)

    if (!results.isEmpty()) {
      return res.status(400).json({ errors: results.array()[0].msg })
    }

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
  }),
]

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

exports.user_search = asyncHandler(async (req, res, next) => {
  let term = req.query.term.toLowerCase()

  if (!term) {
    return res.json([])
  }

  term = term
    .split("")
    .map((char) => ("^!@#$%^&*()-_=+[\\]{};:'\",.<>?/\\|`~".includes(char) ? "\\" + char : char))
    .join("")

  const results = await User.aggregate([
    {
      $match: {
        $or: [{ name: { $regex: "^" + term, $options: "i" } }, { email: { $regex: "^" + term, $options: "i" } }],
      },
    },
    {
      $unset: "password",
    },
  ]).limit(5)

  res.json(results)
})
