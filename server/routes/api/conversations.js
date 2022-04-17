const router = require('express').Router();
const {
  User,
  Conversation,
  Message,
  LastReadMessages,
} = require('../../db/models');
const { Op } = require('sequelize');
const onlineUsers = require('../../onlineUsers');

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get('/', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username'],
      order: [[Conversation, Message, 'id', 'ASC']],
      include: [
        {
          model: Conversation,
          as: 'conversations',
          attributes: ['id', 'createdAt'],
          through: { attributes: [] },
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'username', 'photoUrl'],
              through: { attributes: [] },
            },
            {
              model: LastReadMessages,
              attributes: ['user_id', 'message_id'],
            },
            {
              model: Message,
            },
          ],
        },
      ],
    });

    res.send(
      user.conversations.map((convo) => {
        // create members object to insert into conversation
        const membersObj = {};

        //transfer members array to object
        convo.members.forEach((member) => {
          membersObj[member.id] = {
            id: member.id,
            username: member.username,
            photoUrl: member.photoUrl,
            online: !!onlineUsers.includes(member.id),
          };
        });

        //create an array of user ids excluding the current user, helps replace otherUser functionality
        const otherMemberIds = Object.keys(membersObj)
          .map((member) => parseInt(member))
          .filter((member) => user.id !== member);

        // add last messages to members
        let memberCopy = [...otherMemberIds, user.id];
        convo.lastReadMessages.forEach((member) => {
          membersObj[member.user_id].lastReadMessage = member.message_id;
          memberCopy = memberCopy.filter((id) => id !== member.user_id);
        });

        memberCopy.forEach((id) => {
          membersObj[id].lastReadMessage = 0;
        });

        // set properties for notification count and latest message preview
        convo.latestMessageText =
          convo.messages[convo.messages.length - 1]?.text || '';

        return {
          id: convo.id,
          createdAt: convo.createdAt,
          members: membersObj,
          otherMemberIds,
          latestMessageText: convo.latestMessageText,
          messages: convo.messages,
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

// gets a conversation by id
router.get('/id', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const user = req.user;
    const { convoId } = req.query;

    const conversation = await Conversation.findByPk(convoId, {
      attributes: ['id', 'createdAt'],
      order: [[Message, 'id', 'ASC']],
      through: { attributes: [] },
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'photoUrl'],
          through: { attributes: [] },
        },
        {
          model: LastReadMessages,
          attributes: ['user_id', 'message_id'],
        },
        {
          model: Message,
        },
      ],
    });

    // create members object to insert into conversation
    const membersObj = {};

    //transfer members array to object
    conversation.members.forEach((member) => {
      membersObj[member.id] = {
        id: member.id,
        username: member.username,
        photoUrl: member.photoUrl,
        online: !!onlineUsers.includes(member.id),
      };
    });

    // user is not a member of conversation
    if (!membersObj[user.id]) {
      return res.sendStatus(400);
    }

    //create an array of user ids excluding the current user, helps replace otherUser functionality
    const otherMemberIds = Object.keys(membersObj)
      .map((member) => parseInt(member))
      .filter((member) => user.id !== member);

    // add last messages to members
    let memberCopy = [...otherMemberIds, user.id];
    conversation.lastReadMessages.forEach((member) => {
      membersObj[member.user_id].lastReadMessage = member.message_id;
      memberCopy = memberCopy.filter((id) => id !== member.user_id);
    });

    memberCopy.forEach((id) => {
      membersObj[id].lastReadMessage = 0;
    });

    // set properties for notification count and latest message preview
    conversation.latestMessageText =
      conversation.messages[conversation.messages.length - 1]?.text || '';

    res.send({
      id: conversation.id,
      createdAt: conversation.createdAt,
      members: membersObj,
      otherMemberIds,
      latestMessageText: conversation.latestMessageText,
      messages: conversation.messages,
    });
  } catch (error) {
    next(error);
  }
});

// adds a member to a conversation
router.put('/add', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const { convoId, memberId } = req.body;
    const update = await Conversation.findByPk(convoId).then(
      async (convo) => await convo.addMember(memberId)
    );

    res.send(update);
  } catch (error) {
    next(error);
  }
});

// updates last read messages in conversation
router.put('/read', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const { user_id, message_id, convo_id } = req.body;
    if (userId !== user_id) {
      return res.sendStatus(400);
    }

    const update = await LastReadMessages.findOne({
      where: {
        conversationId: convo_id,
        user_id,
      },
    }).then(async (data) => {
      if (data) {
        data.update({ message_id });
      } else {
        const convo = await Conversation.findByPk(convo_id);
        if (!convo) {
          return res.sendStatus(400);
        }
        const newLastRead = await LastReadMessages.create({
          user_id,
          message_id,
        });

        return await convo.addLastReadMessages(newLastRead);
      }
    });
    res.send(update);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
