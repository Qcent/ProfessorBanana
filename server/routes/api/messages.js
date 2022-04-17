const router = require('express').Router();
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const {
  Conversation,
  Message,
  User,
  ConvoMessage,
} = require('../../db/models');
const onlineUsers = require('../../onlineUsers');

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post('/', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      const message = await Message.create({
        senderId,
        text,
        conversationId,
        isRead: false,
      });
      return res.json({ message, sender });
    }
    // if we don't have conversation id, create a new one with member associations

    // find users for association
    const [member1, member2] = await User.findAll({
      where: {
        id: {
          [Op.or]: [senderId, recipientId],
        },
      },
    });

    // create conversation
    const conversation = await Conversation.create();

    await conversation.addMember(senderId);
    await conversation.addMember(recipientId);

    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
    });

    senderData = {
      id,
      username,
      email,
      photoUrl,
      online = onlineUsers.includes(senderId),
    } = member1.dataValues.id === senderId
      ? member1.dataValues
      : member2.dataValues;

    res.json({ message, sender: { ...senderData }, recipientId });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
