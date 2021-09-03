const multer = require('multer');

const FILE_TYPE = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
];

const fileFilter = (req, file, callback) => {
  const { mimetype } = file;

  if ((FILE_TYPE.includes(mimetype))) {
    callback(null, true);
  }

  callback(null, false);
};

module.exports = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limit: {
    fileSize: 1000,
  },
  onError: (err, next) => {
    console.log({ err });
    next(err);
  },
}).single('imagePoster');
