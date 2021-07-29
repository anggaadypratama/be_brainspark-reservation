const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

function setPassword(value) {
  return bcrypt.hashSync(value, 10);
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    set: setPassword,
  },
});

const model = mongoose.model('User', userSchema);

module.exports = model;
