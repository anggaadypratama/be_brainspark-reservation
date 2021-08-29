require('moment/locale/id');

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
const moment = require('moment');

moment.locale('id');

const mail = {
  send: async (data) => {
    let options = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: path.join(__dirname, '../../../public/template/email'),
        defaultLayout: 'index',
      },
      viewPath: path.join(__dirname, '../../../public/template/email'),
      extName: '.hbs',
    };

    const {
      date,
      eventStart,
      ...props
    } = data;

    const mailOptions = {
      from: 'RPL-GDC Laboratory',
      to: data?.email,
      subject: `Informasi brainspark - ${data?.themeName}`,
      template: 'index',
      context: {
        date: moment(date).format('dddd, Do MMMM YYYY'),
        eventStart: `${moment(eventStart).format('h:mm')} WIB`,
        ...props,
      },
      attachments: [
        {
          filename: 'icon.jpg',
          path: path.join(__dirname, '../../../public/images/icon.jpg'),
          cid: 'icon.jpg',
        },
      ],
    };

    const transporter = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    }));

    transporter.use('compile', hbs(options));

    await transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.log('Error Occurs: ', err);
      } else {
        console.log('Email sent!!!');
      }
    });
  },
};

module.exports = mail;
