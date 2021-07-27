/* eslint-disable no-return-assign */
module.exports = (req, res, next) => {
  res.sendSuccess = (data, message = null, status = 200) => res.status(status).send({
    success: true,
    data,
    message: message ?? 'success',
  });

  res.sendError = (errors, message = null, status = 400) => res.status(status).send({
    success: false,
    errors,
    message: message ?? 'bad_request',
  });

  return next();
};
