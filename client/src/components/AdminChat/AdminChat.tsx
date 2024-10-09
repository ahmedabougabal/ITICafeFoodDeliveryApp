import React, { useEffect, useRef } from 'react';
import classes from './AdminChat.module.css';

interface AdminChatProps {
  onClose: () => void; // function to close the chat
  selectedChat: string;   // email of the user
}

const AdminChat: React.FC<AdminChatProps> = ({ onClose, selectedChat }) => {
  console.log("User Email:", selectedChat);
  
  // Reference to the WebSocket
  const ws = useRef<WebSocket | null>(null);
  
  // Reference to the chat messages div (for scrolling and updating)
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

  // Declare unique room for each user
  const sanitizedUserEmail = selectedChat.replace(/@/g, '_'); // Replace '@' with '_'
  const sanitizedAdminEmail = 'admin@gmail.com'.replace(/@/g, '_'); // Same replacement for admin email
  const roomName = `${sanitizedUserEmail}_${sanitizedAdminEmail}`; // Channel's Group_name must contain only ascii letters

  useEffect(() => {
    // WebSocket connection on mount
    ws.current = new WebSocket(`ws://localhost:8000/ws/rooms/${roomName}/`);

    ws.current.onmessage = (event) => {
      console.log("WebSocket Onmessage!");  
      const data = JSON.parse(event.data);
      appendMessage(data.message); // Append incoming message
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
  }, [roomName]); // Re-run if roomName changes

  // Handle send message
  const handleSendMessage = () => {
    const inputElement = document.querySelector(`.${classes.chatInput}`) as HTMLInputElement;
    const message = inputElement?.value.trim();

    if (message && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message })); // Send message to the WebSocket server
      appendMessage(message, true); // Append own message
      inputElement.value = ''; // Clear input
    }
  };

  return (
    <div className={classes.chatWindow}>
      <div className={classes.chatHeader}>
        <h2>{selectedChat}</h2>
        <button onClick={() => { 
          onClose(); 
        }} className={classes.closeButton}>
          &times;
        </button>
      </div>
      <div id='chat_messages' ref={messagesRef} className={classes.chatContent}></div>
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
