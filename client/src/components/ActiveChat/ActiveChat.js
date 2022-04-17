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

  const otherMemberIds = conversation?.otherMemberIds || [];
  const otherUser = conversation?.members[otherMemberIds[0]] || {};

  return (
    <Box className={classes.root}>
      {isConversation(conversation) && conversation.otherMemberIds && (
        <>
          {otherMemberIds.length > 1 ? (
            <Header
              username={'GroupChat with ' + otherUser.username}
              online={otherUser.online || false}
            />
          ) : (
            <Header
              username={otherUser.username}
              online={otherUser.online || false}
            />
          )}
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
