import React, { useEffect, useRef, useState } from 'react';
import classes from './AdminChat.module.css';

const AdminChat = ({ onClose, selectedChat }) => {
  console.log("User Email:", selectedChat);

  const [messages, setMessages] = useState([]);
  const ws = useRef(null);
  const messagesRef = useRef(null);

  // Function to append message to chat
  const appendMessage = (message, sender, isOwnMessage = false) => {
    console.log(`Appending message from sender: ${sender}`); // Debugging log
  
    const messageElement = document.createElement('div');
    
    // Style the message element based on whether it's the user's own message
    messageElement.className = isOwnMessage ? classes.ownMessage : classes.otherMessage;
  
    // Create a paragraph for the message content
    const contentElement = document.createElement('p');
    contentElement.textContent = message;
  
    // Create a span for the sender name
    const senderElement = document.createElement('span');
    senderElement.textContent = sender;
    senderElement.className = classes.senderName; // Make sure you have appropriate styles here
  
    // Append the sender and message content to the message element
    messageElement.appendChild(senderElement);
    messageElement.appendChild(contentElement);
  
    // Append the message element to the chat content
    messagesRef.current?.appendChild(messageElement);
  
    // Scroll to the bottom to show the latest message
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const roomName = `${selectedChat}_admin@gmail.com`;

  useEffect(() => {
    // Fetch existing messages when the component mounts
    const fetchMessages = async () => {
      try {
        // API call to fetch messages for the selected chat
        const response = await fetch(`http://localhost:8000/rooms/messages/${selectedChat}/admin@gmail.com/`); 
        const data = await response.json();
        setMessages(data); // Set fetched messages to state

        // Append each fetched message to the chat UI
        data.forEach((msg) => {
          appendMessage(msg.content, msg.sender, msg.sender === 'admin@gmail.com'); // Assuming admin's email is used for identification
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // WebSocket connection on mount
    ws.current = new WebSocket(`ws://localhost:8000/ws/rooms/${roomName}/`); // Open WS connection

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data); // Handler triggered when receiving message from server
      appendMessage(data.message, data.sender, data.sender === 'admin@gmail.com'); // Display message in chat window
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed"); // When websocket closed
    };

    // Cleanup on unmount
    return () => { // Open new websocket when selected chat chosen
      if (ws.current) {
        ws.current.close();
        ws.current = null; // Clear the reference
      }
    };
  }, [roomName, selectedChat]);

  // Handle send message when click on send button
  const handleSendMessage = () => {
    const inputElement = document.querySelector(`.${classes.chatInput}`);
    const message = inputElement?.value.trim(); // Get message content

    if (message && ws.current?.readyState === WebSocket.OPEN) { // Ensure message has content and websocket is open.
      // Construct the message object to include sender and receiver
      const messageData = {
        message: message, 
        sender: 'admin@gmail.com', // Sender here is the admin 
        receiver: selectedChat, // Receiver is the user 
      };

      ws.current.send(JSON.stringify(messageData)); // Send message to the WebSocket server
      appendMessage(message, true); // Append own message
      inputElement.value = ''; // Clear input
    }
  };

  return (
    <div className={classes.chatWindow}>
      <div className={classes.chatHeader}>
        <h4>{selectedChat}</h4>
        <button onClick={onClose} className={classes.closeButton}>
          &times;
        </button>
      </div>
      <div ref={messagesRef} className={classes.chatContent}></div>
      {/* Chat input area with Send button */}
      <div className={classes.chatInputContainer}>
        <input
          type="text"
          placeholder="Type a message..."
          className={classes.chatInput}
        />
        <button className={classes.sendButton} onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default AdminChat;
