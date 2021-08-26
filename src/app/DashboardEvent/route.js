const auth = require('@middleware/auth');
const uploadFile = require('@middleware/upload');
const dashboardEventController = require('./controllers');

module.exports = (app) => {
  app.post('/event/', [auth, uploadFile], dashboardEventController.createEventPost);
  app.patch('/event/:id/', [auth, uploadFile], dashboardEventController.editEventById);
  app.delete('/event/:id/', auth, dashboardEventController.deleteEventById);
  app.get('/event/dashboard/', auth, dashboardEventController.getAllEventProtected);
  app.get('/event/dashboard/:id/', auth, dashboardEventController.getEventByIdProtected);
  app.get('/event/', dashboardEventController.getAllEvent);
  app.get('/event/:id/', dashboardEventController.getEventById);
};
