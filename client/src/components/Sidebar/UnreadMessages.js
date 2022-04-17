import React from 'react';
import { Badge } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  badge: {
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: '10px',
  },
}));

const UnreadMessages = ({ count }) => {
  const classes = useStyles();

  return (
    <Badge
      classes={{ badge: `${classes.badge}` }}
      badgeContent={count}
      color="primary"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    />
  );
};

export default UnreadMessages;
