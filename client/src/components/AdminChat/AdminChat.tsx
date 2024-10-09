import React, { useEffect, useRef, useState } from 'react';
import classes from './AdminChat.module.css';

interface AdminChatProps {
  onClose: () => void; // function to close the chat
  selectedChat: string;   // email of the user
}

const AdminChat: React.FC<AdminChatProps> = ({ onClose, selectedChat }) => {
  console.log("User Email:", selectedChat);

  const [messages, setMessages] = useState<{ message: string; sender: string }[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Function to append message to chat
  const appendMessage = (message: string, isOwnMessage = false) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = isOwnMessage ? classes.ownMessage : classes.otherMessage;

    // Append to the chat messages container
    messagesRef.current?.appendChild(messageElement);

    // Scroll to the bottom to show the latest message
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  // Sanitize user email to create a room name
  const sanitizedUserEmail = selectedChat.replace(/@/g, '_');
  const sanitizedAdminEmail = 'admin@gmail.com'.replace(/@/g, '_');
  const roomName = `${sanitizedUserEmail}_${sanitizedAdminEmail}`;

  useEffect(() => {
    // Fetch existing messages when the component mounts
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/messages/${selectedChat}/admin@gmail.com/`);
        const data = await response.json();
        setMessages(data); // Set fetched messages to state

        // Append each fetched message to the chat UI
        data.forEach((msg: { content: string; sender: string }) => {
          appendMessage(msg.content, msg.sender === 'admin@gmail.com'); // Assuming admin's email is used for identification
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // WebSocket connection on mount
    ws.current = new WebSocket(`ws://localhost:8000/ws/rooms/${roomName}/`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      appendMessage(data.message, data.sender === 'admin@gmail.com'); // Check if the sender is admin
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null; // Clear the reference
      }
    };
  }, [roomName, selectedChat]);

  // Handle send message
  const handleSendMessage = () => {
    const inputElement = document.querySelector(`.${classes.chatInput}`) as HTMLInputElement;
    const message = inputElement?.value.trim();

    if (message && ws.current?.readyState === WebSocket.OPEN) {
      // Construct the message object to include sender and receiver
      const messageData = {
        message,
        sender: 'admin@gmail.com',
        receiver: selectedChat
      };

      ws.current.send(JSON.stringify(messageData)); // Send message to the WebSocket server
      appendMessage(message, true); // Append own message
      inputElement.value = ''; // Clear input
    }
  };

  return (
    <div className={classes.chatWindow}>
      <div className={classes.chatHeader}>
        <h2>{selectedChat}</h2>
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
