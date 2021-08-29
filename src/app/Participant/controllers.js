const message = require('@utils/messages');

const validationId = new RegExp('^[0-9a-fA-F]{24}$');
const DashboardEventModel = require('../DashboardEvent/model');
const mail = require('../Mailer/controllers');

module.exports = {
  inputPart: async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    const info = req.body;
    const emailDB = await DashboardEventModel.exists({ _id: id, 'participant.email': email })
      .catch((err) => console.log(''));
    const userDB = await DashboardEventModel.exists({ _id: id }).catch((err) => console.log(''));

    if (!validationId.test(id)) {
      res.sendError({
        message: 'id tidak valid',
        status: 400,
      });
    } else if (!userDB) {
      res.sendError({
        message: 'event sudah dihapus',
        status: 400,
      });
    } else if (emailDB) {
      res.sendError({
        message: {
          email: message.email_exists,
        },
        status: 409,
      });
    } else {
      await DashboardEventModel
        .findByIdAndUpdate(id, { $push: { participant: info } }, { runValidators: true })
        .catch((errors) => {
          if (errors) {
            res.sendError({ errors });
          }
        });
      const idp = await DashboardEventModel
        .find({ _id: id }, { participant: { $elemMatch: { email } } });
      // mail.sendMails(id, idp[0].participant[0].id);
      mail.sendMails();
      res.sendSuccess({ message: message.add_data_success, status: 200 });
    }
  },
  validation: async (req, res) => {
    const { id } = req.params;
    const { email } = req.query;
    const emailDB = await DashboardEventModel.exists({ _id: id, 'participant.email': email })
      .catch((err) => console.log(''));
    if (emailDB) {
      const idp = await DashboardEventModel
        .find({ _id: id }, { participant: { $elemMatch: { email } } });
      const is = await DashboardEventModel
        .find({ _id: id }, { ticketLimit: 100 });
      res.sendSuccess({
        message: {
          email: message.email_found,
          nama: idp[0].participant[0].name,
          idp: idp[0].participant[0].id,
          is,
        },
        status: 200,
      });
      console.log('is : ', is);
    } else {
      res.sendError({
        message: {
          email: 'alamat email anda tidak ditemukan',
        },
        status: 404,
      });
    }
  },

  absen: async (req, res) => {
    const { id } = req.params;
    const { email, feedback } = req.body;

    const dataEvent = await DashboardEventModel.findById(id)
      .catch((err) => err && res.sendError({
        message: 'Id Tidak ditemukan',
      }));

    if (dataEvent?.isAbsentActive) {
      const emailDB = await DashboardEventModel.exists({ _id: id, 'participant.email': email })
        .catch((err) => console.log(''));

      if (emailDB) {
        const datap = await DashboardEventModel.find({ _id: id },
          { participant: { $elemMatch: { email } } });

        console.log(datap[0]?.participant[0]?.isAbsen);

        if (!(datap[0]?.participant[0]?.isAbsen)) {
          const idp = datap[0].participant[0].id;
          const isAbsen = true;
          await DashboardEventModel
            .findOneAndUpdate({ _id: id, 'participant._id': idp },
              { 'participant.$.isAbsen': isAbsen, 'participant.$.feedback': feedback })
            .catch((errors) => {
              if (errors) {
                res.sendError({ errors });
              }
            });
          res.sendSuccess({
            message: {
              email: message.email_found,
              namae: datap[0].participant[0].name,
              idp: datap[0].participant[0].id,
            },
            status: 200,
          });
        } else {
          res.sendError({
            message: 'Kamu telah melakukan absensi',
            status: 409,
          });
        }
      } else {
        res.sendError({
          message: {
            email: 'alamat email anda tidak ditemukan',
          },
          status: 404,
        });
      }
    } else {
      res.sendError({
        message: {
          email: 'Kamu tidak bisa mengakses halaman ini',
        },
        status: 404,
      });
    }
  },
};
