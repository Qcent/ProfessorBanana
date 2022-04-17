import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

const useStyles = makeStyles((theme) => ({
  ellipsis: {
    color: '#95A7C4',
    marginRight: 24,
    opacity: 0.5,
  },
}));

export default function ChatOptionMenu({
  activeConversation,
  makeActiveChat,
  addUserToConvo,
  otherUser,
}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleAddUser = () => {
    addUserToConvo(activeConversation, otherUser);
    handleClose();
  };

  const startChat = () => {
    makeActiveChat();
    handleClose();
  };

  return (
    <>
      <Button
        classes={{ root: classes.ellipsis }}
        id="chat-option-button"
        aria-controls={open ? 'chat-option-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreHorizIcon />
      </Button>
      <Menu
        id="chat-option-menu"
        aria-labelledby="chat-option-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {activeConversation && (
          <MenuItem onClick={handleAddUser}>Add user to current chat</MenuItem>
        )}
        <MenuItem onClick={startChat}>Start chat</MenuItem>
      </Menu>
    </>
  );
}
