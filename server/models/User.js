const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['employee', 'admin', 'superadmin'],
    default: 'employee',
  }
  // Other user-related data can be included here
});

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
