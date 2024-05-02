const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Message", messageSchema)
