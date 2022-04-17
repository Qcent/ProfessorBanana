import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '.';
import moment from 'moment';

const Messages = (props) => {
  const { conversation, userId, markMessagesRead } = props;

  const { id: conversationId, messages, members } = conversation;

  const lastReadOtherUserMessage = () => {
    if (!messages.length) return 0;
    let i = messages.length - 1;
    while (i >= 0 && messages[i].senderId === userId) {
      i--;
    }
    if (i < 0) return 0;
    return messages[i].id;
  };

  useEffect(() => {
    const lastRead = lastReadOtherUserMessage();
    if (
      messages.length &&
      members[`${userId}`].lastReadMessage < messages[messages.length - 1].id &&
      lastRead !== members[`${userId}`].lastReadMessage
    ) {
      markMessagesRead({
        user_id: userId,
        message_id: lastRead,
        convo_id: conversationId,
      });
    }
  });

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format('h:mm');
        return message.senderId === userId ? (
          <SenderBubble
            key={message.id}
            messageId={message.id}
            text={message.text}
            time={time}
            members={members}
            myId={userId}
          />
        ) : (
          <OtherUserBubble
            key={message.id}
            messageId={message.id}
            text={message.text}
            time={time}
            otherUser={members[`${message.senderId}`]}
            members={members}
            myId={userId}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
