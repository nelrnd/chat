const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Message = require("./message")

const chatSchema = new Schema({
  title: { type: String, length: { max: 50 } },
  image: { type: String, default: "" },
  desc: { type: String, default: "" },
  members: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], required: true },
  lastViewed: { type: Schema.Types.Mixed, required: true },
  admin: { type: mongoose.Types.ObjectId, ref: "User" },
})

chatSchema.methods.getUnreadCount = async function (userId) {
  return await Message.countDocuments({
    chat: this._id,
    timestamp: { $gt: this.lastViewed[userId] },
    from: { $ne: userId },
  })
}

chatSchema.virtual("type").get(function () {
  return this.members.length > 2 ? "group" : "private"
})

module.exports = mongoose.model("Chat", chatSchema)
