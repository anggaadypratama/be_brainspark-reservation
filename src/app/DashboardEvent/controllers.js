const message = require('@utils/messages');
const stream = require('stream');
const moment = require('moment');
const drive = require('@root/src/utils/helpers/driveApis');
const DashboardEventModel = require('./model');

const validationId = new RegExp('^[0-9a-fA-F]{24}$');

module.exports = {
  createEventPost: async (req, res) => {
    if (!req.file) {
      res.sendError({ message: message.upload_image_problem, status: 422 });
    }

    const fileObject = req.file;
    let bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);

    const { id: imageId } = await drive.upload(bufferStream, fileObject)
      .catch((errors) => res.sendError({ errors }));

    const { webViewLink } = await drive.get(imageId)
      .catch((errors) => res.sendError({ errors }));
    const getImageId = webViewLink.split('/');
    const imagePoster = `https://drive.google.com/uc?id=${getImageId[getImageId.length - 2]}`;

    let {
      isOnlyTelkom,
      ticketLimit,
      ...stringData
    } = req.body;

    isOnlyTelkom = isOnlyTelkom && JSON.parse(isOnlyTelkom)?.isOnlyTelkom;
    ticketLimit = ticketLimit && Number(ticketLimit);

    const DashboardEvent = new DashboardEventModel({
      ...stringData,
      isFinished: false,
      registrationClosed: false,
      isOnlyTelkom,
      ticketLimit,
      imagePoster,
      imageId,
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

    const data = await DashboardEventModel.find()
      .catch((errors) => errors && res.sendError({ status: 500, errors }));

    const dataFiltered = await Promise.all(data?.map(async ({
      _id, themeName, imagePoster, date, eventStart, location, eventEnd,
    }) => {
      const isEventDone = moment(eventEnd).format() < moment().format();
      return ({
        _id, themeName, imagePoster, date, eventStart, isEventDone, location, eventEnd,
      });
    }));

    switch (isDone) {
      case 0:
        return res.sendSuccess({
          status: 200,
          data: dataFiltered,
        });
      case 1:
        return res.sendSuccess({
          status: 200,
          data: dataFiltered.filter(({ isEventDone }) => isEventDone),
        });
      case 2:
        return res.sendSuccess({
          status: 200,
          data: dataFiltered.filter(({ isEventDone }) => !isEventDone),
        });
      default:
        return res.sendError({
          status: 404,
          message: 'filter tidak ada',
        });
    }
  },

  getAllEventProtected: async (req, res) => {
    const isDone = Number(req.query.isFinished) || 0;

    let data = await DashboardEventModel.find()
      .catch((errors) => errors && res.sendError({ status: 500, errors }));

    const dataFiltered = await Promise.all(data.map(async ({
      _id,
      themeName,
      description,
      date,
      eventStart,
      eventEnd,
      speakerName,
      location,
      endRegistration,
      note,
      isOnlyTelkom,
      ticketLimit,
      imagePoster,
      participant,
    }) => {
      const isEventDone = moment(eventEnd).format() < moment().format();

      return {
        _id,
        themeName,
        description,
        date,
        eventStart,
        eventEnd,
        speakerName,
        location,
        endRegistration,
        note,
        isOnlyTelkom,
        ticketLimit,
        imagePoster,
        participant,
        isEventDone,
      };
    }));

    switch (isDone) {
      case 0:
        return res.sendSuccess({
          status: 200,
          data: dataFiltered,
        });
      case 1:
        return res.sendSuccess({
          status: 200,
          data: dataFiltered.filter(({ isEventDone }) => isEventDone),
        });
      case 2:
        return res.sendSuccess({
          status: 200,
          data: dataFiltered.filter(({ isEventDone }) => !isEventDone),
        });
      default:
        return res.sendError({
          status: 404,
          message: 'filter tidak ada',
        });
    }
  },

  getEventById: async (req, res) => {
    const { id: idEvent } = req.params;

    if (!validationId.test(idEvent)) {
      res.sendError({
        message: 'id tidak ditemukan',
        status: 404,
      });
    } else {
      await DashboardEventModel.findById(idEvent, (errors, data) => {
        if (errors) return res.sendError({ status: 500, errors });
        if (!data) return res.sendError({ status: 404, message: message.data_notfound });

        const {
          _id: id,
          themeName,
          date,
          eventStart,
          eventEnd,
          speakerName,
          location,
          linkLocation,
          endRegistration,
          isFinished,
          registrationClosed,
          isOnlyTelkom,
          description,
          ticketLimit,
          imagePoster,
          imageId,
          participant,
          isAbsentActive,
        } = data;

        const note = data?.note ?? {};

        return res.sendSuccess({
          status: 200,
          data: {
            id,
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
            linkLocation,
            ticketLimit,
            imagePoster,
            imageId,
            description,
            isEventDone: moment(eventEnd).format() < moment().format(),
            note,
            totalParticipant: participant.length,
            isAbsentActive,
          },
        });
      });
    }
  },

  getEventByIdProtected: async (req, res) => {
    const { id: idEvent } = req.params;

    if (!validationId.test(idEvent)) {
      res.sendError({
        message: 'id tidak ditemukan',
        status: 404,
      });
    } else {
      await DashboardEventModel.findById(idEvent, (errors, data) => {
        if (errors) return res.sendError({ status: 500, errors });
        if (!data) return res.sendError({ status: 404, message: message.data_notfound });

        const {
          _id: id,
          themeName,
          date,
          eventStart,
          eventEnd,
          speakerName,
          location,
          linkLocation,
          endRegistration,
          isFinished,
          registrationClosed,
          isOnlyTelkom,
          description,
          ticketLimit,
          imagePoster,
          imageId,
          participant,
          isAbsentActive,
          isLinkLocation,
        } = data;

        const note = data?.note ?? {};

        return res.sendSuccess({
          status: 200,
          data: {
            id,
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
            linkLocation,
            ticketLimit,
            imagePoster,
            imageId,
            description,
            isEventDone: moment(eventEnd).format() < moment().format(),
            note,
            totalParticipant: participant.length,
            isAbsentActive,
            isLinkLocation,
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
      const removeImage = async (imgId) => {
        try {
          await drive.delete(imgId)
            .catch((errors) => res.sendError(errors));
        } catch (errors) {
          res.sendError({ message: 'gambar tidak ada', errors, status: 500 });
        }
      };

      await DashboardEventModel.findById(id, async (errors, data) => {
        if (!data) {
          res.sendError({ message: message.data_notfound, status: 404 });
        } else {
          if (data) {
            removeImage(data?.imageId);
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
      if (!req.file) {
        res.sendError({ message: message.upload_image_problem, status: 422 });
      }

      const removeImage = async (imgId) => {
        await drive.delete(imgId)
          .catch((errors) => res.sendError({ message: 'gambar tidak ada', errors, status: 500 }));
      };

      const databasePoster = await DashboardEventModel.findById(id);

      await removeImage(databasePoster?.imageId);

      const fileObject = req.file;
      let bufferStream = new stream.PassThrough();
      bufferStream.end(fileObject.buffer);

      const { id: imageId } = await drive.upload(bufferStream, fileObject)
        .catch((errors) => res.sendError({ errors }));

      const { webViewLink } = await drive.get(imageId)
        .catch((errors) => res.sendError({ errors }));
      const getImageId = webViewLink.split('/');
      const imagePoster = `https://drive.google.com/uc?id=${getImageId[getImageId.length - 2]}`;

      // eslint-disable-next-line consistent-return

      let {
        isOnlyTelkom: onlyTelkom,
        note: notes,
        description: desc,
        ticketLimit: ticketLim,
        ...stringData
      } = req.body;

      const isOnlyTelkom = onlyTelkom && JSON.parse(onlyTelkom)?.isOnlyTelkom;
      const ticketLimit = ticketLim && Number(ticketLim);

      const data = {
        imagePoster,
        imageId,
        isOnlyTelkom,
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
