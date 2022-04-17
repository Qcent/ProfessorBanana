const Sequelize = require('sequelize');
const { Op } = Sequelize;
const db = require('../db');
const Message = require('./message');

const Conversation = db.define('conversation', {});
const UserConvos = db.define('convos', {}, { timestamps: false });
const LastReadMessages = db.define('lastReadMessages', {
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  message_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = { Conversation, UserConvos, LastReadMessages };
