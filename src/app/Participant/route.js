const dataController = require('./controllers');

module.exports = (app) =>{
  app.put('/event/:id/participant/', dataController.inputPart); 
  // app.post('/event/:id/', dataController.inputPart);
};