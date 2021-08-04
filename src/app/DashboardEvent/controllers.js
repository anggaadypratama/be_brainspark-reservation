const message = require('@utils/messages');
const path = require('path');
const fs = require('fs');
const DashboardEventModel = require('./model');

const validationId = new RegExp('^[0-9a-fA-F]{24}$');

module.exports = {
  createEventPost: async (req, res) => {
    if (!req.file?.path) {
      res.sendError({ message: message.upload_image_problem, status: 422 });
    }

    const imagePoster = req?.file?.path.replace('public/', '');

    let {
      isOnlyTelkom,
      note,
      description,
      ticketLimit,
      ...stringData
    } = req.body;

    description = description && JSON.parse(description);
    note = note ? JSON.parse(note) : {};

    isOnlyTelkom = isOnlyTelkom && JSON.parse(isOnlyTelkom)?.isOnlyTelkom;
    ticketLimit = ticketLimit && Number(ticketLimit);

    const DashboardEvent = new DashboardEventModel({
      ...stringData,
      isFinished: false,
      registrationClosed: false,
      isOnlyTelkom,
      note,
      description,
      ticketLimit,
      imagePoster,
    });

    await DashboardEvent.save((errors) => {
      if (errors) return res.sendError({ status: 500, errors });
      return res.sendSuccess({
        status: 201,
        message: message.add_data_success,
        data: [DashboardEvent],
      });
    });
  },

  getAllEvent: async (req, res) => {
    const isDone = Number(req.query.isFinished) || 0;

    const isRegistrationClosed = await DashboardEventModel.updateMany({
      $or: [{
        ticketLimit: {
          $eq: 100, // expected document from database check equality
        },
      }, {
        endRegistration: {
          $lte: new Date(),
        },
      }],
    }, {
      registrationClosed: true,
    }).catch((errors) => errors && res.sendError(errors));

    const isFinishedUpdate = await DashboardEventModel.updateMany({
      eventEnd: {
        $lt: new Date(),
      },
    }, {
      isFinished: true,
    }).catch((errors) => errors && res.sendError(errors));

    console.log({ isFinishedUpdate, isRegistrationClosed });

    let data = await DashboardEventModel.find()
      .catch((errors) => errors && res.sendError({ status: 500, errors }));

    data = data.map(({
      _id, themeName, imagePoster, date, eventStart, isFinished, location,
    }) => ({
      _id, themeName, imagePoster, date, eventStart, isFinished, location,
    }));

    switch (isDone) {
      case 0:
        return res.sendSuccess({
          status: 200,
          data,
        });
      case 1:
        return res.sendSuccess({
          status: 200,
          data: data.filter(({ isFinished }) => isFinished),
        });
      default:
        return res.sendError({
          status: 404,
          message: 'filter tidak ada',
        });
    }
  },

  getEventById: async (req, res) => {
    const { id } = req.params;

    if (!validationId.test(id)) {
      res.sendError({
        message: 'id tidak ditemukan',
        status: 404,
      });
    } else {
      await DashboardEventModel.findById(id, (errors, data) => {
        if (errors) return res.sendError({ status: 500, errors });
        if (!data) return res.sendError({ status: 404, message: message.data_notfound });

        const {
          _id,
          themeName,
          date,
          eventStart,
          eventEnd,
          speakerName,
          location,
          endRegistration,
          isFinished,
          registrationClosed,
          isOnlyTelkom,
          description,
          ticketLimit,
          imagePoster,
        } = data;

        const note = data?.note ?? {};

        return res.sendSuccess({
          status: 200,
          data: {
            _id,
            themeName,
            date,
            eventStart,
            eventEnd,
            speakerName,
            location,
            endRegistration,
            isFinished,
            registrationClosed,
            isOnlyTelkom,
            ticketLimit,
            imagePoster,
            description,
            note,
          },
        });
      });
    }
  },

  deleteEventById: async (req, res) => {
    const { id } = req.params;

    if (!validationId.test(id)) {
      res.sendError({
        message: 'id tidak ditemukan',
        status: 404,
      });
    } else {
      const removeImage = (file) => {
        try {
          if (file) {
            const filePath = path.join(__dirname, '../../../public', file);
            fs.unlink(filePath, (errors) => {
              if (errors) {
                res.sendError({ message: message.failed_remove.image, status: 500 });
              }
            });
          }
        } catch (errors) {
          res.sendError({ message: 'gambar tidak ada', errors, status: 500 });
        }
      };

      await DashboardEventModel.findById(id, async (errors, data) => {
        if (!data) {
          res.sendError({ message: message.data_notfound, status: 404 });
        } else {
          if (data) {
            removeImage(data?.imagePoster);
          }

          await DashboardEventModel.findByIdAndRemove(id, (error, docs) => {
            if (error) return res.sendError({ message: message.failed_remove.data, status: 500 });

            return docs;
          });

          if (errors) res.sendError({ errors });

          res.sendSuccess({
            message: {
              data: message.success_remove.data,
              image: message.success_remove.image,
            },
          });
        }
      });
    }
  },

  editEventById: async (req, res) => {
    const { id } = req.params;

    if (!validationId.test(id)) {
      res.sendError({
        message: 'id tidak ditemukan',
        status: 404,
      });
    } else {
      if (!req.file?.path) {
        res.sendError({ message: message.upload_image_problem, status: 422 });
      }

      const poster = req?.file?.path.replace('public/', '');

      // eslint-disable-next-line consistent-return
      const removeImage = (file, newPoster) => {
        try {
          if (file) {
            const filePath = path.join(__dirname, '../../../public', file);
            fs.unlink(filePath, (errors) => {
              if (errors) {
                res.sendError({ message: message.failed_remove.image, status: 500 });
              }
            });
          }

          return newPoster;
        } catch (errors) {
          res.sendError({ message: 'gambar tidak ada', errors, status: 500 });
        }
      };

      let {
        isOnlyTelkom: onlyTelkom,
        note: notes,
        description: desc,
        ticketLimit: ticketLim,
        ...stringData
      } = req.body;

      const description = desc && JSON.parse(desc);
      const note = notes && JSON.parse(notes);

      const isOnlyTelkom = onlyTelkom && JSON.parse(onlyTelkom)?.isOnlyTelkom;
      const ticketLimit = ticketLim && Number(ticketLim);

      const databasePoster = await DashboardEventModel.findById(id);

      const imagePoster = databasePoster?.imagePoster !== poster
        ? removeImage(databasePoster?.imagePoster, poster)
        : databasePoster;

      const data = {
        imagePoster,
        isOnlyTelkom,
        note,
        description,
        ticketLimit,
        ...stringData,
      };

      const dataUpdate = await DashboardEventModel
        .findByIdAndUpdate(id, data, { new: true })
        .catch((errors) => {
          if (errors) {
            res.sendError({ errors });
          }
        });

      res.sendSuccess({ data: dataUpdate });
    }
  },

};
