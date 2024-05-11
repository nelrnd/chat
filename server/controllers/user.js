const User = require("../models/user")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const multer = require("multer")
const passport = require("passport")
require("../strategies/jwtStrategy")
require("../strategies/googleStrategy")
require("../strategies/githubStrategy")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/avatars/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + "-" + file.originalname)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, cb) => {
    const mimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!mimeTypes.includes(file.mimetype)) {
      return cb(new Error("file is not allowed"))
    }
    cb(null, true)
  },
})

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

exports.user_check_auth = passport.authenticate("jwt", { session: false })

exports.user_google_start = passport.authenticate("google", { session: false })

exports.user_google_redirect = [
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET)
    res.cookie("token", token)
    res.redirect(process.env.CLIENT_BASE_URL)
  },
]

exports.user_github_start = passport.authenticate("github", { session: false })

exports.user_github_redirect = [
  passport.authenticate("github", { session: false, failureRedirect: process.env.CLIENT_BASE_URL + "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET)
    res.cookie("token", token)
    res.redirect(process.env.CLIENT_BASE_URL)
  },
]

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
        $and: [
          {
            $or: [{ name: { $regex: "^" + term, $options: "i" } }, { email: { $regex: "^" + term, $options: "i" } }],
          },
          {
            // remove authUser from search results
            _id: { $ne: req.user._id },
          },
        ],
      },
    },
    {
      $unset: "password",
    },
  ]).limit(5)

  res.json(results)
})

exports.user_update = [
  upload.single("avatar"),
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("bio").trim().optional().escape(),
  asyncHandler(async (req, res) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
      return res.status(400).json({ message: result.array()[0].msg })
    }

    const userId = req.user._id

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: req.body.name,
        bio: req.body.bio,
        avatar: (req.file && req.file.path) || req.body.avatar,
      },
      { new: true }
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(updatedUser)
  }),
]

exports.user_delete = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const deletedUser = await User.findByIdAndDelete(userId).select("-password")

  if (!deletedUser) {
    return res.status(404).json({ message: "User not found" })
  }

  res.json(deletedUser)
})
