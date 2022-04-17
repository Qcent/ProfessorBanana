import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Search, Chat, CurrentUser } from './index';

const useStyles = makeStyles(() => ({
  root: {
    paddingLeft: 21,
    paddingRight: 21,
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    letterSpacing: -0.29,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 15,
  },
}));

const Sidebar = ({
  handleChange,
  searchTerm,
  conversations = [],
  user,
  setActiveChat,
  activeConversation,
  addUserToConvo,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <CurrentUser user={user} />
      <Typography className={classes.title}>Chats</Typography>
      <Search handleChange={handleChange} />
      {conversations
        // put the searched user fake convos on top
        .sort((a, b) =>
          typeof b.id < typeof a.id ? -1 : typeof a.id < typeof b.id ? 1 : 0
        )
        // put most recent messaged conversations on top
        .sort(
          (a, b) =>
            b.messages[b.messages.length - 1]?.id -
              a.messages[a.messages.length - 1]?.id || 0
        )
        .map((conversation) => {
          return (
            <Chat
              key={conversation.id}
              conversation={conversation}
              user={user}
              setActiveChat={setActiveChat}
              activeConversation={activeConversation}
              addUserToConvo={addUserToConvo}
            />
          );
        })}
    </Box>
  );
};

export default Sidebar;
