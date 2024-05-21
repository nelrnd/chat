const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  content: { type: String },
  images: { type: [{ type: mongoose.Types.ObjectId, ref: "Image" }] },
  sender: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  chat: { type: mongoose.Types.ObjectId, ref: "Chat", required: true },
  timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Message", messageSchema)
