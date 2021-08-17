const dataController = require('./controllers');

module.exports = (app) => {
  app.put('/event/:id/participant/', dataController.inputPart);
  app.get('/event/:id/absen/validate/', dataController.validation);
  app.put('/event/:id/absen/validated/', dataController.absen);
};
