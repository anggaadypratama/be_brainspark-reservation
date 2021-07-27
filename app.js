require('module-alias/register');
require('express-group-routes');
require('dotenv').config();

require('@utils/database/db.connection');

const express = require('express');
const compression = require('compression');
const path = require('path');
const createError = require('http-errors');

const app = express();
const apiRouters = require('@routes');

const port = process.env.API_PORT || 3000;

// middleware
app.use(require('@middleware'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.group('/api', (router) => {
  apiRouters(router);
});

// handle response
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.sendError(err, err.message, err.status);
});

app.listen(port, () => {
  console.log(`server run at port ${port}`);
});
