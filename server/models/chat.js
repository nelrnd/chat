const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
  members: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], required: true, length: { min: 1 } },
  unreadCount: { type: mongoose.Schema.Types.Mixed },
})

module.exports = mongoose.model("Chat", chatSchema)
