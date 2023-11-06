const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  id: { type: String },
}, {
  collection: "user"
});

module.exports = mongoose.model("UserOauth", userSchema);
