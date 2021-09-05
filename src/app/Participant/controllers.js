const message = require('@utils/messages');

const validationId = new RegExp('^[0-9a-fA-F]{24}$');
const mail = require('@utils/helpers/mail');
const cached = require('@root/src/utils/helpers/cached');
const DashboardEventModel = require('../DashboardEvent/model');

module.exports = {
  inputPart: async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    const info = req.body;
    const emailDB = await DashboardEventModel.exists({ _id: id, 'participant.email': email })
      .catch((errors) => res.sendError({ errors }));
    const userDB = await DashboardEventModel.exists({ _id: id })
      .catch((errors) => res.sendError({ errors }));

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

      cached.delete(id);
      cached.delete('allEvent');
      cached.delete('allEventDashboard');
      await DashboardEventModel
        .find({ _id: id }, { participant: { $elemMatch: { email } } });

      const dataEmail = await DashboardEventModel.findById(id);

      const {
        speakerName,
        themeName,
        location,
        date,
        eventStart,
        isLinkLocation,
        linkLocation,
      } = dataEmail;

      const sendData = {
        speakerName,
        themeName,
        location,
        date,
        eventStart,
        isLinkLocation,
        linkLocation,
        name: req.body?.name,
        email,
      };

      mail.send(sendData);
      res.sendSuccess({ message: message.add_data_success, status: 200 });
    }
  },

  validation: async (req, res) => {
    const { id } = req.params;
    const { email } = req.query;
    const emailDB = await DashboardEventModel.exists({ _id: id, 'participant.email': email })
      .catch((errors) => res.sendError({ errors }));
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
        },
        status: 200,
      });
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

    const dataEvent = await cached.getOrSet(id, async () => {
      const detailCache = await DashboardEventModel.findById(id)
        .catch((errors) => res.sendError({ status: 500, errors }));

      return detailCache;
    });

    if (dataEvent?.isAbsentActive) {
      const emailDB = await DashboardEventModel.exists({ _id: id, 'participant.email': email })
        .catch((errors) => res.sendError({ errors }));

      if (emailDB) {
        const datap = await DashboardEventModel.find({ _id: id },
          { participant: { $elemMatch: { email } } });

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

          cached.delete(id);
          cached.delete('allEvent');
          cached.delete('allEventDashboard');

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
