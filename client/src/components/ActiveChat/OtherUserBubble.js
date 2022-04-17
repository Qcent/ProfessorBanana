import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Avatar } from '@material-ui/core';
import { BadgeAvatar } from '../Sidebar';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
  },
  avatar: {
    height: 36,
    width: 36,
    marginRight: 11,
    marginTop: 6,
  },
  usernameDate: {
    fontSize: 11,
    color: '#BECCE2',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bubble: {
    backgroundImage: 'linear-gradient(225deg, #6CC1FF 0%, #3A8DFF 100%)',
    borderRadius: '0 10px 10px 10px',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    padding: 8,
  },
  avatarSmall: {
    height: 28,
    width: 28,
    marginRight: 11,
    marginTop: 6,
  },
  lastRead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}));

const OtherUserBubble = ({
  time,
  text,
  otherUser,
  messageId,
  members,
  myId,
  groupChat,
}) => {
  const classes = useStyles();

  let avatars = [];
  for (const memberId in members) {
    const member = members[memberId];

    if (member.lastReadMessage === messageId && memberId !== `${myId}`) {
      avatars.push(
        <Avatar
          key={member.id}
          alt={member.username}
          src={member.photoUrl}
          className={classes.avatarSmall}
        />
      );
    }
  }

  return (
    <Box className={classes.root}>
      {groupChat.true ? (
        <BadgeAvatar
          photoUrl={otherUser.photoUrl}
          username={otherUser.username}
          online={otherUser.online}
          inChat={true}
        />
      ) : (
        <Avatar
          alt={otherUser.username}
          src={otherUser.photoUrl}
          className={classes.avatar}
        />
      )}
      <Box>
        <Typography className={classes.usernameDate}>
          {otherUser.username} {time}
        </Typography>
        <Box className={classes.bubble}>
          <Typography className={classes.text}>{text}</Typography>
        </Box>
        <Box className={classes.lastRead}>{avatars}</Box>
      </Box>
    </Box>
  );
};

export default OtherUserBubble;
