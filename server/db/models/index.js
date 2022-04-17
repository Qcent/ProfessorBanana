const {
  Conversation,
  UserConvos,
  LastReadMessages,
} = require('./conversation');
const User = require('./user');
const Message = require('./message');

// associations

User.belongsToMany(Conversation, { through: UserConvos });
Conversation.belongsToMany(User, {
  as: 'members',
  through: UserConvos,
});

Conversation.hasMany(LastReadMessages);
LastReadMessages.belongsTo(Conversation);

Message.belongsTo(Conversation);
const ConvoMessage = Conversation.hasMany(Message);

module.exports = {
  User,
  Conversation,
  Message,
  LastReadMessages,
  ConvoMessage,
};
