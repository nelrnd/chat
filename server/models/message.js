const mongoose = require("mongoose")
const Schema = mongoose.Schema

const messageSchema = new Schema({
  text: String,
  images: [{ type: mongoose.Types.ObjectId, ref: "Media" }],
  links: [{ type: mongoose.Types.ObjectId, ref: "Media" }],
  from: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  chat: { type: mongoose.Types.ObjectId, ref: "Chat", required: true },
  timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Message", messageSchema)
