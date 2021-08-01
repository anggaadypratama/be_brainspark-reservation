const mongoose = require('mongoose');

const dbConnection = process.env.DB_CONNECTION;

mongoose.Promise = global.Promise;

mongoose.connect(dbConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).then(() => {
  console.log('terhubung ke database!');
})
  .catch((err) => {
    console.log('tidak dapat terhubung ke database!', err);
    process.exit();
  });
