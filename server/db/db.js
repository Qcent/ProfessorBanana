const Sequelize = require('sequelize');

const db = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost:5432/messenger',
  {
    logging: false,
    dialectOptions: {
      ssl: {
        require: true, // This will help you. But you will see new error
        rejectUnauthorized: false, // This line will fix new error
      },
    },
  }
);

module.exports = db;
