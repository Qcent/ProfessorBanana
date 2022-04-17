import React from 'react';
import { Box, Badge, Avatar } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  profilePic: {
    height: 44,
    width: 44,
  },
  badge: {
    height: 13,
    width: 13,
    borderRadius: '50%',
    border: '2px solid white',
    backgroundColor: '#D0DAE9',
  },
  online: {
    backgroundColor: '#1CED84',
  },
  sidebar: {
    marginLeft: 17,
  },
  inChatPic: {
    height: 36,
    width: 36,
    marginRight: 11,
    marginTop: 6,
  },
  inChatBadge: {
    height: 10,
    width: 10,
    marginRight: 8,
  },
  asReadPic: {
    height: 28,
    width: 28,
    marginRight: 11,
    marginTop: 6,
  },
  asReadBadge: {
    height: 8,
    width: 8,
    marginRight: 8,
  },
}));

const UserAvatar = ({
  sidebar,
  username,
  photoUrl,
  online,
  inChat,
  asRead,
}) => {
  const classes = useStyles();

  return (
    <Box className={sidebar ? classes.sidebar : ''}>
      <Badge
        classes={{
          badge: `${classes.badge} ${inChat && classes.inChatBadge} ${
            asRead && classes.asReadBadge
          } ${online && classes.online}`,
        }}
        variant="dot"
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        overlap="circular"
      >
        <Avatar
          alt={username}
          src={photoUrl}
          className={`${classes.profilePic} ${inChat && classes.inChatPic} ${
            asRead && classes.asReadPic
          }`}
        />
      </Badge>
    </Box>
  );
};

export default UserAvatar;
