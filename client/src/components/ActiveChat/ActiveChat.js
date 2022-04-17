import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { Input, Header, Messages } from './index';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexGrow: 8,
    flexDirection: 'column',
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
}));

const ActiveChat = ({
  user,
  conversations,
  activeConversation,
  postMessage,
  markMessagesRead,
}) => {
  const classes = useStyles();

  const conversation = conversations
    ? conversations.find(
        (conversation) => conversation.id === activeConversation
      )
    : {};

  const isConversation = (obj) => {
    return obj !== {} && obj !== undefined;
  };

  const otherUser =
    conversation?.members[conversation?.otherMemberIds[0]] || {};
  const groupChat = { true: conversation?.otherMemberIds.length > 1 };

  if (groupChat.true) {
    const { otherMemberIds, members } = conversation;

    for (let i = 0; i < otherMemberIds.length; i++) {
      i === 0
        ? (groupChat.username = `${members[otherMemberIds[i]].username}`)
        : (groupChat.username += `, ${members[otherMemberIds[i]].username}`);

      members[otherMemberIds[i]].online && groupChat.onlineCount
        ? groupChat.onlineCount++
        : (groupChat.onlineCount = 1);
    }
  }

  return (
    <Box className={classes.root}>
      {isConversation(conversation) && (
        <>
          <Header
            username={otherUser.username}
            online={otherUser.online || false}
            groupChat={groupChat}
          />

          <Box className={classes.chatContainer}>
            {user && (
              <>
                <Messages
                  conversation={conversation}
                  userId={user.id}
                  markMessagesRead={markMessagesRead}
                />
                <Input
                  otherUser={otherUser}
                  conversationId={conversation.id || null}
                  user={user}
                  postMessage={postMessage}
                />
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ActiveChat;
