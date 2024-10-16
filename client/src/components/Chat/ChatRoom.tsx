import React, { useEffect, useRef, useState } from "react";
import classes from "./chatRoom.module.css";

interface ChatRoomProps {
  onClose: () => void; // function to close the chat
  userEmail: string; // email of the user
}

const ChatRoom: React.FC<ChatRoomProps> = ({ onClose, userEmail }) => {
  const [messages, setMessages] = useState<
    { message: string; sender: string }[]
  >([]);
  const ws = useRef<WebSocket | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Function to append message to chat
  const appendMessage = (
    message: string,
    sender: string,
    isOwnMessage = false
  ) => {
    console.log(`Appending message from sender: ${sender}`); // Debugging log

    const messageElement = document.createElement("div");

    // Style the message element based on whether it's the user's own message
    messageElement.className = isOwnMessage
      ? classes.ownMessage
      : classes.otherMessage;

    // Create a paragraph for the message content
    const contentElement = document.createElement("p");
    contentElement.textContent = message;

    // Create a span for the sender name
    const senderElement = document.createElement("span");
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
    
  // Fetch existing messages when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // api which call function in view through urls.py to get messages for database ordered by date
        const response = await fetch(
          `http://localhost:8000/rooms/messages/${userEmail}/admin@gmail.com/`
        );
        const data = await response.json();
        setMessages(data); // Set fetched messages to state

        // Append each fetched message to the chat UI
        data.forEach((msg: { content: string; sender: string }) => {
          appendMessage(msg.content, msg.sender, msg.sender === userEmail);
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
      // handler triggered when recieving message form server which is another user
      const data = JSON.parse(event.data);
      appendMessage(data.message, data.sender, data.sender === userEmail); // dispaly message in chat window, function exist in the top
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed"); // when websocket closed, almost when server stopped
    };

    return () => {
      // open new websocket when logged user changed
      ws.current?.close(); // Cleanup WebSocket connection on component unmount
    };
  }, [userEmail]);

  // Handle send message when click on send button
  const handleSendMessage = () => {
    const inputElement = document.querySelector(
      `.${classes.chatInput}`
    ) as HTMLInputElement;
    const message = inputElement?.value.trim();

    if (message && ws.current?.readyState === WebSocket.OPEN) {
      // ensure message has content and websocket is open.
      // Construct the message object to include sender and receiver
      const messageData = {
        message: message,
        sender: userEmail, // sender here is the user
        receiver: "admin@gmail.com", // reciever is the admin
      };

      ws.current.send(JSON.stringify(messageData)); // Send message_object to the WebSocket server
      appendMessage(message, true); // Append own message
      inputElement.value = ""; // Clear input
    }
  };

  return (
    <div className={classes.chatWindow}>
      <div className={classes.chatHeader}>
      <h1>ITI Cafe Is Here!</h1>
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
        <button className={classes.sendButton} onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
