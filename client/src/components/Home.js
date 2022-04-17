import React, { useCallback, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Grid, CssBaseline, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { SidebarContainer } from '../components/Sidebar';
import { ActiveChat } from '../components/ActiveChat';
import { SocketContext } from '../context/socket';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
}));

const Home = ({ user, logout }) => {
  const history = useHistory();

  const socket = useContext(SocketContext);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [fetchConvo, setFetchConvo] = useState(null);

  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const markMessagesRead = async (lastReadData) => {
    try {
      if (!lastReadData) return;
      const data = await saveReadStatus(lastReadData);
      if (data) {
        updateReadStatus(lastReadData);
        broadcastMessagesRead(lastReadData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const broadcastMessagesRead = (lastReadData) => {
    socket.emit('read-message', {
      ...lastReadData,
    });
  };

  const saveReadStatus = async (body) => {
    const data = await axios.put('/api/conversations/read', body);
    return data;
  };

  const updateReadStatus = useCallback(
    (data) => {
      const { user_id, convo_id, message_id } = data;
      setConversations((prev) =>
        prev.map((convo) => {
          if (convo.id === convo_id) {
            const convoCopy = { ...convo };
            convoCopy.members[`${user_id}`].lastReadMessage = message_id;
            if (user.id === user_id) {
              convoCopy.myUnreadMessageCount = 0;
            }
            return convoCopy;
          } else {
            return convo;
          }
        })
      );
    },
    [user]
  );

  const addSearchedUsers = (users) => {
    let currentUsers = {};

    const newState = conversations.filter(
      (convo) => typeof convo.id === 'number'
    );

    // make table of current users so we can lookup faster
    newState.forEach((convo) => {
      if (convo.otherMemberIds.length === 1) {
        currentUsers[convo.otherMemberIds[0]] = true;
      }
    });

    users.forEach((otherUser, index) => {
      // only create a fake convo if we don't already have a convo with this user
      if (!currentUsers[otherUser.id]) {
        let fakeConvo = {
          id: 'searched' + index,
          members: {
            [otherUser.id]: { ...otherUser },
            [user.id]: { ...user },
          },
          otherMemberIds: [otherUser.id],
          messages: [],
        };
        newState.push(fakeConvo);
      }
    });

    setConversations(newState);
  };

  const clearSearchedUsers = (exception) => {
    setConversations((prev) =>
      prev.filter(
        (convo) => typeof convo.id === 'number' || convo.id === exception
      )
    );
  };

  const saveMessage = async (body) => {
    const { data } = await axios.post('/api/messages', body);
    return data;
  };

  const sendMessage = (data, body) => {
    socket.emit('new-message', {
      message: data.message,
      conversationId: body.conversationId,
      sender: data.sender,
      recipientId: data.recipientId,
    });
  };

  const postMessage = async (body) => {
    try {
      const convoId = body.conversationId;
      if (typeof convoId === 'string') delete body.conversationId;
      const data = await saveMessage(body);
      if (!body.conversationId) {
        addNewConvo(data.message);
        if (typeof convoId === 'string')
          setActiveChat(data.message.conversationId);
      } else {
        addMessageToConversation(data);
      }

      sendMessage(data, body);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewConvo = useCallback((message) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (typeof convo.id === 'string') {
          const convoCopy = { ...convo };
          convoCopy.messages.push(message);
          convoCopy.latestMessageText = message.text;
          convoCopy.id = message.conversationId;
          convoCopy.myUnreadMessageCount = 0;
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  const addMessageToConversation = useCallback(
    (data) => {
      setConversations((prev) => {
        // if sender isn't null, that means the message needs to be put in a brand new convo
        const { message, sender = null, recipientId } = data;
        if (sender !== null && recipientId === user.id) {
          const newConvo = {
            id: message.conversationId,
            members: {
              [sender.id]: { ...sender, lastReadMessage: message.id },
              [user.id]: { ...user },
            },
            messages: [message],
            otherMemberIds: [sender.id],
            latestMessageText: message.text,
            myUnreadMessageCount: 1,
          };
          return [...prev, newConvo];
        } else {
          return prev.map((convo) => {
            if (convo.id === message.conversationId) {
              const convoCopy = { ...convo };
              convoCopy.messages.push(message);
              convoCopy.latestMessageText = message.text;
              if (message.senderId !== user.id) {
                convoCopy.myUnreadMessageCount++;
              }
              return convoCopy;
            } else {
              return convo;
            }
          });
        }
      });
    },
    [user]
  );

  const setActiveChat = (conversationId) => {
    setActiveConversation(conversationId);
    clearSearchedUsers(conversationId);
  };

  const addOnlineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.members[id]) {
          const convoCopy = { ...convo };
          convoCopy.members[id].online = true;
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  const removeOfflineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.members[id]) {
          const convoCopy = { ...convo };
          convoCopy.members[id].online = false;
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  const addUserToConvo = async (convoId, memberData) => {
    try {
      if (!memberData || !convoId) return;
      const data = await requestAddUserToConvo({
        convoId,
        memberId: memberData.id,
      });
      if (data) {
        clearSearchedUsers();
        addMemberToLocalConvo({ convoId, member: memberData });
        broadcastAddUserToConvo({ convoId, member: memberData });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const broadcastAddUserToConvo = (data) => {
    socket.emit('add-user-to-group-chat', {
      ...data,
    });
  };

  const requestAddUserToConvo = async (body) => {
    const data = await axios.put('/api/conversations/add', body);
    return data;
  };

  const addMemberToLocalConvo = useCallback(
    (data) => {
      const { convoId, member } = data;
      if (member.id === user.id) {
        setFetchConvo(convoId);
        return;
      }
      setConversations((prev) =>
        prev.map((convo) => {
          if (convo.id === convoId) {
            const convoCopy = { ...convo };
            convoCopy.members[member.id] = { ...member };
            return convoCopy;
          } else {
            return convo;
          }
        })
      );
    },
    [user]
  );

  // Lifecycle

  useEffect(() => {
    // Socket init
    socket.on('add-online-user', addOnlineUser);
    socket.on('remove-offline-user', removeOfflineUser);
    socket.on('new-message', addMessageToConversation);
    socket.on('read-message', updateReadStatus);
    socket.on('add-user-to-group-chat', addMemberToLocalConvo);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off('add-online-user', addOnlineUser);
      socket.off('remove-offline-user', removeOfflineUser);
      socket.off('new-message', addMessageToConversation);
      socket.off('read-message', updateReadStatus);
      socket.off('add-user-to-group-chat', addMemberToLocalConvo);
    };
  }, [
    addMessageToConversation,
    addOnlineUser,
    removeOfflineUser,
    updateReadStatus,
    addMemberToLocalConvo,
    socket,
  ]);

  useEffect(() => {
    // when fetching, prevent redirect
    if (user?.isFetching) return;

    if (user && user.id) {
      setIsLoggedIn(true);
    } else {
      // If we were previously logged in, redirect to login instead of register
      if (isLoggedIn) history.push('/login');
      else history.push('/register');
    }
  }, [user, history, isLoggedIn]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('/api/conversations');
        setConversations(
          data.map((convo) => {
            convo.myUnreadMessageCount = convo.messages.filter(
              (message) =>
                message.id > convo.members[`${user.id}`].lastReadMessage &&
                message.senderId !== user.id
            ).length;

            return convo;
          })
        );
      } catch (error) {
        console.error(error);
      }
    };
    if (!user.isFetching) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    const fetchConvoById = async () => {
      try {
        const { data } = await axios.get('/api/conversations/id', {
          params: { convoId: fetchConvo },
        });
        setConversations((prev) => [...prev, data]);
      } catch (error) {
        console.error(error);
      }
    };

    if (fetchConvo) {
      fetchConvoById();
    }
  }, [user, fetchConvo]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  return (
    <>
      <Button onClick={handleLogout}>Logout</Button>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <SidebarContainer
          conversations={conversations}
          user={user}
          clearSearchedUsers={clearSearchedUsers}
          addSearchedUsers={addSearchedUsers}
          addUserToConvo={addUserToConvo}
          setActiveChat={setActiveChat}
          activeConversation={activeConversation}
        />
        <ActiveChat
          activeConversation={activeConversation}
          conversations={conversations}
          user={user}
          postMessage={postMessage}
          markMessagesRead={markMessagesRead}
        />
      </Grid>
    </>
  );
};

export default Home;
