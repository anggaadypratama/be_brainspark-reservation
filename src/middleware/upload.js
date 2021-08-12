const multer = require('multer');

const FILE_TYPE = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

const fileStorage = multer.diskStorage({
  destination: (req, res, callback) => {
    callback(null, 'public/images');
  },

  filename: (req, file, callback) => {
    callback(null, `${new Date().getTime().toString()}_${file.originalname}`);
  },

});

const fileFilter = (req, file, callback) => {
  const { mimetype } = file;

  if ((FILE_TYPE.includes(mimetype))) {
    callback(null, true);
  }

  callback(null, false);
};

module.exports = multer({
  storage: fileStorage,
  fileFilter,
  limit: {
    fileSize: 1000,
  },
  onError: (err, next) => {
    console.log({ err });
    next(err);
  },
}).single('imagePoster');
