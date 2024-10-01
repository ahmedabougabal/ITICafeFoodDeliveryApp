import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface AuthMessageProps {
  message: string;
  type: 'success' | 'error';
}

const MessageContainer = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 5px;
  background-color: ${props => props.type === 'success' ? '#4CAF50' : '#f44336'};
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;

  &.visible {
    opacity: 1;
  }
`;

const AuthMessage: React.FC<AuthMessageProps> = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return isVisible ? (
    <MessageContainer type={type} className={isVisible ? 'visible' : ''}>
      {message}
    </MessageContainer>
  ) : null;
};

export default AuthMessage;