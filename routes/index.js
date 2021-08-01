const authRoute = require('@app/Auth/route');
const dashboardRoute = require('@app/DashboardEvent/route');

module.exports = (app) => {
  authRoute(app);
  dashboardRoute(app);
};
