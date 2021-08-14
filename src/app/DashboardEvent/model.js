const mongoose = require('mongoose');
const { stringify } = require('uuid');
// const participantModel = require('../Participant/model');

const eventSchema = new mongoose.Schema({
  themeName: {
    type: String,
    required: true,
  },
  imagePoster: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  eventStart: {
    type: Date,
    required: true,
  },
  eventEnd: {
    type: Date,
    required: true,
  },
  speakerName: {
    type: String,
    required: true,
  },
  isOnlyTelkom: {
    type: Boolean,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  linkLocation: {
    type: String,
  },
  endRegistration: {
    type: Date,
    required: true,
  },
  ticketLimit: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
  },
  // processed in server
  isFinished: {
    type: Boolean,
    required: true,
  },
  registrationClosed: {
    type: Boolean,
    required: true,
  },
  participant: [{
    namae: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    nim: {
      type: String,
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
    isAbsen: {
      type: String,
      default: false,
    },
    feedback: {
      type: String,
    },

  }],
});

const model = mongoose.model('Event', eventSchema);

module.exports = model;
