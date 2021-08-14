const message = require('@utils/messages');

const validationId = new RegExp('^[0-9a-fA-F]{24}$');
const DashboardEventModel = require('../DashboardEvent/model');

module.exports = {
  inputPart: async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    const info = req.body;

    // kemungkinan method exists mengembalikan obejct atau nilai undefined yang
    // akan membuat res.error, jd kita coba pke chaining operator (.?)

    const emailDB = await DashboardEventModel.exists({ _id: id, 'participant.email': email })
      .catch((err) => console.log(''));

    const userDB = await DashboardEventModel.exists({ _id: id }).catch((err) => console.log(''));

    if (!validationId.test(id)) {
      res.sendError({
        message: 'id tidak valid',
        status: 404,
      });
      console.log('emailDBs : ', emailDB);
    } else if (!userDB) {
      res.sendError({
        message: 'event sudah dihapus',
        status: 404,
      });
      console.log('emailDB : ', emailDB);
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
      console.log('sateto', emailDB);
      res.sendSuccess({ message: message.add_data_success, status: 201 });
    }
  },
  absen: async (req, res) => {
    // jika email tidak ditemukan send error
    // jika email ditemukan error mati kirim data
    // berisi id participantnya (_id:id,
    // 'participant._id': idp, nama

    // + field isAbsen (boolean),def.val(false)
    // , feedback (string) = DashboardEventModel
    // default value di model participant field isAbsen

    const { id } = req.params;
    const { email, namae, feedback } = req.body;
    const emailDB = await DashboardEventModel.exists({ _id: id, 'participant.email': email }).catch((err) => console.log(''));
    if (emailDB) {
      const datauser = await DashboardEventModel.find({ _id: id, 'participant.email': email });
      // setelah email ditemukan dan user mengirim feedback ..
      // get id sama nama u/ dikirim lewat respon
      // update isAbsen dan feedback dengan method model.update()
      res.sendSuccess({
        message: {
          email: message.email_exists,
          id: [DashboardEventModel],
          namae: datauser,
        },
        status: 409,
      });
    } else {
      res.sendError({
        message: {
          email: 'hmm email anda tidak ditemukan',
        },
        status: 409,
      });
    }
  },
};
