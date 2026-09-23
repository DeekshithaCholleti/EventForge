const app = require('./app');
const { connectDB } = require('./config/database');
const { port } = require('./config/env');

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`EventForge API running on port ${port}`);
  });
};

startServer();

module.exports = app;
