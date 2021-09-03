require('module-alias/register');
require('express-group-routes');
require('dotenv').config();

require('@root/src/utils/database/mongo');

const express = require('express');
const compression = require('compression');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const apiRouters = require('@routes');
const middleware = require('@middleware');
const auth = require('@middleware/auth');

const port = process.env.PORT || 3000;

// middleware
app.use(cors({
  origin: '*'
}));
app.use(middleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression({ level: 9 }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public/images'));

app.use(morgan('dev'));

app.group('/api', (router) => {
  apiRouters(router);
  router.get('/', auth, ((req, res) => {
    res.sendSuccess({
      message: {
        name: 'brainspark reservation',
      },
    });
  }));
});

// handle response
app.use((req, res, next) => {
  res.sendError({ message: 'Endpoint not found', status: 404 });
});

app.use((err, req, res) => {
  res.sendError({ errors: err, message: err.message, status: err.status });
});

app.listen(port, () => {
  console.log(`berjalan di port ${port}`);
});
