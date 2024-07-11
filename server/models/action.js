const mongoose = require("mongoose")
const Schema = mongoose.Schema

const actionSchema = new Schema({
  action: { type: String, required: true },
  agent: { type: mongoose.Types.ObjectId, ref: "User" },
  subject: { type: mongoose.Types.ObjectId, ref: "User" },
  value: { type: String },
})

module.exports = mongoose.model("Action", actionSchema)
