const auth = require('@middleware/auth');
const uploadFile = require('@middleware/upload');
const dashboardEventController = require('./controllers');

module.exports = (app) => {
  app.post('/event/', [auth, uploadFile], dashboardEventController.createEventPost);
  app.patch('/event/:id/', [auth, uploadFile], dashboardEventController.editEventById);
  app.get('/event/', dashboardEventController.getAllEvent);
  app.get('/event/:id/', dashboardEventController.getEventById);
  app.delete('/event/:id/', auth, dashboardEventController.deleteEventById);
};
