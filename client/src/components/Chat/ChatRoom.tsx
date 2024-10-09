import React, { useEffect, useRef, useState } from 'react';
import classes from './chatRoom.module.css';

interface ChatRoomProps {
  onClose: () => void; // function to close the chat
  userEmail: string;   // email of the user
}

const ChatRoom: React.FC<ChatRoomProps> = ({ onClose, userEmail }) => {
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

  // Fetch existing messages when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/messages/${userEmail}/admin@gmail.com/`);
        const data = await response.json();
        setMessages(data); // Set fetched messages to state

        // Append each fetched message to the chat UI
        data.forEach((msg: { content: string; sender: string }) => {
          appendMessage(msg.content, msg.sender === userEmail);
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // WebSocket connection on first render
    const roomName = `${userEmail}_admin@gmail.com`;
    ws.current = new WebSocket(`ws://localhost:8000/ws/rooms/${roomName}/`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      appendMessage(data.message, data.sender === userEmail);
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.current?.close(); // Cleanup WebSocket connection on component unmount
    };
  }, [userEmail]);

  // Handle send message
  const handleSendMessage = () => {
    const inputElement = document.querySelector(`.${classes.chatInput}`) as HTMLInputElement;
    const message = inputElement?.value.trim();

    if (message && ws.current?.readyState === WebSocket.OPEN) {
      const receiverEmail = 'admin@gmail.com'; // Specify receiver
      ws.current.send(JSON.stringify({ message, sender: userEmail, receiver: receiverEmail }));
      appendMessage(message, true);
      inputElement.value = ''; // Clear input
    }
  };

  return (
    <div className={classes.chatWindow}>
      <div className={classes.chatHeader}>
        <h2>ITI Cafe</h2>
        <button onClick={onClose} className={classes.closeButton}>
          &times;
        </button>
      </div>
      <div ref={messagesRef} className={classes.chatContent}></div>
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

export default ChatRoom;
