const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  nim: {
    type: Number,
  },
  Status: {
    type: String,
  },
  fakultas: {
    type: String,
  },
  whatsapp: {
    type: String,
  },
  line: {
    type: String,
  },
});

module.exports = participantSchema;
