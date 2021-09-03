const auth = require('@middleware/auth');
const usersController = require('./controllers');

module.exports = (app) => {
  app.post('/users/', auth, usersController.create);
  app.post('/users/login/', usersController.login);
};
