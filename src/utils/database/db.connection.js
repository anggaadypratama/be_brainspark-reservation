const mongoose = require('mongoose');

const dbConnection = process.env.DB_CONNECTION;

mongoose.Promise = global.Promise;

mongoose.connect(dbConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to the database!');
})
  .catch((err) => {
    console.log('Cannot connect to the database!', err);
    process.exit();
  });
