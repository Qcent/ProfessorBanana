import React from 'react';
import { Box } from '@material-ui/core';
import { BadgeAvatar, ChatContent, UnreadMessages } from '../Sidebar';
import { makeStyles } from '@material-ui/core/styles';
import ChatOptionMenu from './ChatOptionMenu';

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      cursor: 'grab',
    },
  },
  main: {
    borderRadius: 8,
    height: 80,
    boxShadow: '0 2px 10px 0 rgba(88,133,196,0.05)',
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const Chat = ({
  conversation,
  setActiveChat,
  activeConversation,
  addUserToConvo,
  user,
}) => {
  const classes = useStyles();
  const { otherMemberIds } = conversation;
  let otherUser = conversation.members[otherMemberIds[0]];

  const handleClick = async () => {
    await setActiveChat(conversation.id);
  };

  if (otherMemberIds.length > 1) {
    // find the most recent other user that left a message
    let i = conversation.messages.length - 1;
    while (i >= 0 && conversation.messages[i].senderId === user.id) {
      i--;
    }
    otherUser =
      i >= 0
        ? conversation.members[conversation.messages[i].senderId] ||
          conversation.members[otherMemberIds[0]]
        : conversation.members[otherMemberIds[0]];
  } else {
    otherUser = conversation.members[otherMemberIds[0]];
  }

  return (
    <Box
      onClick={() => handleClick()}
      className={`${classes.main} ${classes.root}`}
    >
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={conversation} otherUser={otherUser} />
      <UnreadMessages count={conversation.myUnreadMessageCount} />
      {(typeof conversation.id === 'string' || activeConversation) &&
        conversation.id !== activeConversation && (
          <ChatOptionMenu
            activeConversation={activeConversation}
            makeActiveChat={handleClick}
            addUserToConvo={addUserToConvo}
            otherUser={otherUser}
          />
        )}
    </Box>
  );
};

export default Chat;
