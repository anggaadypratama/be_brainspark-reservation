const nodemailer = require('nodemailer');

const { stringify } = require('uuid');

const handlebars = require('handlebars');
const fs = require('fs');
let smtpTransport = require('nodemailer-smtp-transport');
const path = require('path');

const moment = require('moment');

const { timeStamp } = require('console');
const DashboardEventModel = require('../DashboardEvent/model');
require('dotenv').config();

module.exports = {
  sendMails: async (ide, idp) => {
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, '/brainspark-email/index.hbs'), 'utf8');
    const template = handlebars.compile(emailTemplateSource);
    // const htmlToSend = template({ message: 'Hello World!' });
    const event = await DashboardEventModel.find({ _id: ide });
    const part = await DashboardEventModel
      .find({ _id: ide }, { participant: { $elemMatch: { _id: idp } } });
    const names = part[0].participant[0].name;
    const eventTheme = event[0].themeName;
    const speaker = event[0].speakerName;
    const date = moment(event[0].date).format('dddd, MMMM YYYY');
    const time = moment(event[0].date).format('HH:m:s A');
    const lLoc = event[0].linkLocation;
    const loc = event[0].location;

    handlebars.registerHelper('ifCond', function(v1, v2, options) {
      if(v1 < v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    const htmlToSend = template({
      name: names,
      eventTheme,
      speaker,
      date,
      time,
      linlinkLocation: lLoc,
      location: loc,
      // link: 'link',
      // location: 'location',
    });

    let smtpTransports = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    }));
    // const event = await DashboardEventModel.find({ _id: ide });
    // const part = await DashboardEventModel
    //   .find({ _id: ide }, { participant: { $elemMatch: { _id: idp } } });
    // const names = part[0].participant[0].name;
    // const time = moment(event[0].date).format('HH:m:s A');
    // const loc = event[0].linkLocation;
    // const eventStarts = moment(event[0].date).format('dddd, MMMM YYYY');

    // let readHTMLFile = (path, callback) => {
    //   fs.readFile(path, { encoding: 'utf-8' }, (err, html) => {
    //     if (err) {
    //       throw err;
    //       // console.log(err);
    //       callback(err);
    //     } else {
    //       callback(null, html);
    //     }
    //   });
    // };

    const mailOptions = {
      from: 'rplgdcLab@gmail.com',
      to: 'muhammadrizqia@student.telkomuniversity.ac.id',
      subject: 'well',
      html: htmlToSend,
      attachments: [
        {
          filename: 'icon.webp',
          path: path.join(__dirname, '/brainspark-email/images/icon.webp'),
          cid: 'icon.webp',
        },
        {
          filename: 'Vector5.png',
          path: path.join(__dirname, '/brainspark-email/images/Vector5.png'),
          cid: 'Vector5.png',
        },
        {
          filename: 'Vector6.png',
          path: path.join(__dirname, '/brainspark-email/images/Vector6.png'),
          cid: 'Vector6.png',
        },
      ],
    };

    smtpTransports.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.log('Error Occurs: ', err);
      } else {
        console.log('Email sent!!!');
      }
    });

    // readHTMLFile(`${__dirname}app/public/pages/emailWithPDF.html`, (err, html) => {
    // { D:\2020_2021\RPLGDC\BE\BE-BRAINSPARK-RESERVATION\src\app\Mailer\brainspark-email\index.html
    // readHTMLFile(`${__dirname}/brainspark-email/index.hbs`, (err, html) => {
    //   let template = handlebars.compile(html);
    //   let replacements = {
    //     name: names,
    //     date: eventStarts,
    //     time,
    //     location: loc,
    //   };
    //   let htmlToSend = template(replacements);
    //   let mailOptions = {
    //     from: 'rplgdcLab@gmail.com',
    //     to: 'muhammadrizqia@student.telkomuniversity.ac.id',
    //     subject: 'brainsparks',
    //     html: htmlToSend,
    //   };
    //   smtpTransport.sendMail(mailOptions, (error, response) => {
    //     if (err) {
    //       console.log('Error Occurs: ', err);
    //     } else {
    //       console.log('Email sent!!!');
    //     }
    //   });
    // });
  },
};
