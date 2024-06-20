const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Message = require("./message")

const chatSchema = new Schema({
  members: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], required: true, length: { min: 2 } },
  lastViewed: { type: Schema.Types.Mixed, required: true },
})

chatSchema.methods.getUnreadCount = async function (userId) {
  return await Message.countDocuments({ timestamp: { $gt: this.lastViewed[userId] }, from: { $ne: userId } })
}

module.exports = mongoose.model("Chat", chatSchema)
