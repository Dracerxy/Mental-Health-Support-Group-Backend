const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  expert: { type: Boolean, default: false },
  googleauth: { type: Boolean, default: false },
  id: { type: String },
  profilePicture: { type: String,default:null },
  bioData: { type: String , default:""},
}, {
  collection: "user"
});

module.exports = mongoose.model("User", userSchema);
