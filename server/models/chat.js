const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
  members: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], required: true, length: { min: 1 } },
})

module.exports = mongoose.model("Chat", chatSchema)
