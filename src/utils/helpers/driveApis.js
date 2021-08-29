// const stream = require('stream');
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const GDrive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

const drive = {
  upload: (buffer, file) => new Promise((resolve, reject) => {
    GDrive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: [process.env.FOLDER_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: buffer,
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  }),

  get: async (fileId) => {
    await GDrive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const { data } = await GDrive.files.get({
      fileId,
      fields: 'webViewLink',
    })
      .catch(({ message }) => Promise.reject(message));

    return (data);
  },

  delete: (fileId) => new Promise((resolve, reject) => {
    GDrive.files.delete({
      fileId,
    }).then(({ data, status }) => resolve({ data, status }))
      .catch(({ message }) => reject(message));
  }),

};

module.exports = drive;
