const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({

});

const model = mongoose.model('Event', eventSchema);

module.exports = model;
