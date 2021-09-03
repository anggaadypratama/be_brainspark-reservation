const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const message = require('@utils/messages');
const User = require('./model');

const jwtKey = process.env.API_JWT_KEY;
const jwtExpire = process.env.API_JWT_EXPIRE;

module.exports = {
  create: async (req, res) => {
    const { username, password } = req.body;

    const userDB = await User.findOne({ username });

    if (username === userDB?.username) {
      res.sendError({
        message: {
          username: message.user_exists,
        },
        status: 409,
      });
    } else {
      await User.create({
        username, password,
      });

      res.sendSuccess({ message: message.add_data_success, status: 201 });
    }
  },

  login: async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      res.sendError({
        message: {
          username: message.user_not_availabe,
        },
      });
    } else if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        const payload = { username: user.username, role: 'admin' };
        const token = jwt.sign(payload, jwtKey, { expiresIn: jwtExpire });

        res.sendSuccess({ data: token, message: message.login_success });
      } else {
        res.sendError({
          message: {
            password: message.wrong_password,
          },
        });
      }
    } else {
      res.sendError({ message: message.unauthenticated, status: 401 });
    }
  },
};
