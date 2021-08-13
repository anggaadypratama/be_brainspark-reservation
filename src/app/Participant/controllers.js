const message = require('@utils/messages');

const validationId = new RegExp('^[0-9a-fA-F]{24}$');
const DashboardEventModel = require('../DashboardEvent/model');

module.exports = {
  inputPart: async (req, res) => {
    const { id } = req.params;

    const email = req.body;
    const info = email;
    const emailDB = await DashboardEventModel
      .exists({ _id: id, 'participant.email': email }).catch((err) => console.log(''));

    const userDB = await DashboardEventModel.exists({ _id: id }).catch((err) => console.log(''));

    if (!validationId.test(id)) {
      res.sendError({
        message: 'id tidak valid',
        status: 404,
      });
    } else if (!userDB) {
      res.sendError({
        message: 'event sudah dihapus',
        status: 404,
      });
    } else if (emailDB) {
      res.sendError({
        message: {
          email: message.email_exists,
        },
        status: 409,
      });
      console.log('emailDB : ', emailDB);
    } else {
      await DashboardEventModel
        .findByIdAndUpdate(id, { $push: { participant: info } }, { runValidators: true })
        .catch((errors) => {
          if (errors) {
            res.sendError({ errors });
          }
        });
      res.sendSuccess({ message: message.add_data_success, status: 201 });
    }
  },
};
