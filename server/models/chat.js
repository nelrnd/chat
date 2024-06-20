const mongoose = require("mongoose")
const Schema = mongoose.Schema

const chatSchema = new Schema({
  members: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], required: true, length: { min: 2 } },
  unreadCount: { type: mongoose.Schema.Types.Mixed },
})

module.exports = mongoose.model("Chat", chatSchema)
