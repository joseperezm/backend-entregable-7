const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String},
  email: { type: String, required: true, index: true, unique: true },
  age: { type: Number},
  role: { type: String, default: 'user' },
  password: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
