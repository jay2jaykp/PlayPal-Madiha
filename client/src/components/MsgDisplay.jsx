import Messages from './Messages';
import MsgInput from './MsgInput';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../helper';

export default function MsgDisplay({ user, selectedUser }) {
  const BASEURL = `${BASE_URL}` || 'http://localhost:8000';
  const userId = user?.user_id;
  const selectedUserId = selectedUser?.user_id;
  const [usersMessages, setUsersMessages] = useState(null);
  const [selectedUsersMessages, setSelectedUsersMessages] = useState(null);

  const getUsersMessages = async () => {
    try {
      const response = await axios.get(`${BASEURL}/messages`, {
        params: { userId: userId, correspondingUserId: selectedUserId }
      });
      setUsersMessages(response.data);
    } catch (error) {
      console.log("error " , error);
    }
  };

  const getSelectedUsersMessages = async () => {
    try {
        const response = await axios.get(`${BASEURL}/messages`, {
            params: { userId: selectedUserId , correspondingUserId: userId}
        })
        setSelectedUsersMessages(response.data)
    } catch (error) {
        console.log(error)
    }
}

  useEffect(() => {
    getUsersMessages();
    getSelectedUsersMessages();
  }, []);

  console.log("here are users message:" , usersMessages);

  const messages = []

    usersMessages?.forEach(message => {
        const formattedMessage = {}
        formattedMessage['name'] = user?.child_name
        formattedMessage['img'] = user?.picture
        formattedMessage['message'] = message.message
        formattedMessage['timestamp'] = message.timestamp
        messages.push(formattedMessage)
    })

    selectedUsersMessages?.forEach(message => {
        const formattedMessage = {}
        formattedMessage['name'] = selectedUser?.child_name
        formattedMessage['img'] = selectedUser?.picture
        formattedMessage['message'] = message.message
        formattedMessage['timestamp'] = message.timestamp
        messages.push(formattedMessage)
    })

    const descendingOrderMessages = messages?.sort((a,b) => a.timestamp.localeCompare(b.timestamp));

     return (
    <div className="msgDisplay">
      <Messages descendingOrderMessages={descendingOrderMessages}/>
     <MsgInput
         user={user}
         selectedUser={selectedUser}
          getUserMessages={getUsersMessages}
           getSelectedUsersMessages={getSelectedUsersMessages}/>
      
    </div>
  );
}
