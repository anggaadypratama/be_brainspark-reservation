const dataController = require('./controllers');

module.exports = (app) => {
  app.put('/event/:id/participant/', dataController.inputPart);
  app.get('/event/:id/absent/validate/', dataController.validation);
  app.put('/event/:id/absent/', dataController.absen);
};
