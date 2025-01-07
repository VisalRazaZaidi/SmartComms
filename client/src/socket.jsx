import { createContext, useMemo, useContext } from 'react';
import io from 'socket.io-client';
import { server } from './constants/config';

const SocketContext = createContext();

const getSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io(server, { withCredentials: true }), []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, getSocket };

// New socket.io code

const socket = io('http://localhost:9090'); // Replace with your backend URL

// Reference to the audio file
const notificationSound = new Audio('./assets/notification.mp3');

// Listen for new message event
socket.on('NEW_MESSAGE', (data) => {
  console.log('New message received:', data);

  // Play the notification sound
  notificationSound
    .play('/client/src/assets/notification.mp3' || Audio)
    .catch((err) => {
      console.error('Error playing notification sound:', err);
    });

  // Optionally, update the UI with the new message
  addMessageToChat(data);
});

// Function to update the chat UI
function addMessageToChat(message) {
  const chatBox = document.getElementById('chatBox'); // Replace with your chat container ID
  const messageElement = document.createElement('div');
  messageElement.innerText = `${message.sender.name}: ${message.content}`;
  chatBox.appendChild(messageElement);
}

//Original source:

// import { createContext, useMemo, useContext } from "react";
// import io from "socket.io-client";
// import { server } from "./constants/config";

// const SocketContext = createContext();

// const getSocket = () => useContext(SocketContext);

// const SocketProvider = ({ children }) => {
//   const socket = useMemo(() => io(server, { withCredentials: true }), []);

//   return (
//     <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
//   );
// };

// export { SocketProvider, getSocket };
