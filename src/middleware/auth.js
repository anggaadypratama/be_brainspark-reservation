/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, process.env.API_JWT_KEY, (err, decoded) => {
      if (err) { return res.sendError({ errors: err, message: 'problem dengan token', status: 401 }); }

      req.decoded = decoded;
      next();
    });
  } else {
    return res.sendError({ status: 403, message: 'token tidak tersedia' });
  }
};
