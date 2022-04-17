import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Avatar } from '@material-ui/core';
import { BadgeAvatar } from '../Sidebar';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 11,
    color: '#BECCE2',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: '#91A3C0',
    letterSpacing: -0.2,
    padding: 8,
    fontWeight: 'bold',
  },
  bubble: {
    background: '#F4F6FA',
    borderRadius: '10px 10px 0 10px',
  },
  avatar: {
    height: 28,
    width: 28,
    marginRight: 11,
    marginTop: 6,
  },
  lastRead: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
}));

const SenderBubble = ({
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
        groupChat.true ? (
          <BadgeAvatar
            key={member.id}
            photoUrl={member.photoUrl}
            username={member.username}
            online={member.online}
            asRead={true}
          />
        ) : (
          <Avatar
            key={member.id}
            alt={member.username}
            src={member.photoUrl}
            className={classes.avatarSmall}
          />
        )
      );
    }
  }

  return (
    <Box className={classes.root}>
      <Typography className={classes.date}>{time}</Typography>
      <Box className={classes.bubble}>
        <Typography className={classes.text}>{text}</Typography>
      </Box>
      <Box className={classes.lastRead}>{avatars}</Box>
    </Box>
  );
};

export default SenderBubble;
