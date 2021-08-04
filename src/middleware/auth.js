/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const bearerHeader = req.headers.authorization;

  if (bearerHeader) {
    const token = bearerHeader.split(' ')[1];

    jwt.verify(token, process.env.API_JWT_KEY, (err, decoded) => {
      if (err) { return res.sendError({ errors: err, message: 'problem dengan token', status: 401 }); }

      req.decoded = decoded;
      next();
    });
  } else {
    return res.sendError({ status: 403, message: 'token tidak tersedia' });
  }
};
