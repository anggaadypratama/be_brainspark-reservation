const authRoute = require('@app/Auth/route');
const dashboardRoute = require('@app/DashboardEvent/route');
const partRoute = require('@app/Participant/route');

module.exports = (app) => {
  authRoute(app);
  dashboardRoute(app);
  partRoute(app);
};
