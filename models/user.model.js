const mongoose = require("mongoose");

// Build Schema
const UserSchema = mongoose.Schema({
  email: {
    unique: true,
    required: true,
    type: String,
    trim: true,
  },
  username: {
    unique: true,
    required: true,
    type: String,
    trim: true,
  },
  password: {
    required: true,
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
