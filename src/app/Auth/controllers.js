const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
          username: 'username sudah ada',
        },
        status: 409,
      });
    } else {
      await User.create({
        username, password,
      });

      res.sendSuccess({ message: 'user berhasil ditambahkan', status: 201 });
    }
  },

  login: async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      res.sendError({
        message: {
          username: 'user tidak ditemukan',
        },
      });
    } else if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        const payload = { username: user.username, role: 'admin' };
        const token = jwt.sign(payload, jwtKey, { expiresIn: jwtExpire });

        res.sendSuccess({ data: token, message: 'berhasil login' });
      } else {
        res.sendError({
          message: {
            password: 'password yang dimasukan salah',
          },
        });
      }
    } else {
      res.sendError({ message: 'tidak terautorisasi', status: 401 });
    }
  },
};
