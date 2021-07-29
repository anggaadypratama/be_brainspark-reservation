/* eslint-disable no-return-assign */
module.exports = (req, res, next) => {
  res.sendSuccess = ({ data = [], message = null, status = 200 }) => res.status(status).send({
    success: true,
    message: message ?? 'success',
    status,
    data,
  });

  res.sendError = ({ errors, message = null, status = 400 }) => res.status(status).send({
    success: false,
    message: message ?? 'bad_request',
    status,
    errors,
  });

  return next();
};
