import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now()); // Calculate initial time left
  const [isNegative, setIsNegative] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = targetTime - Date.now(); // Calculate remaining time
        if (newTime <= 0 && !isNegative) {
          if (onComplete) {
            onComplete(); // Trigger onComplete callback
          }
          setIsNegative(true); // Continue with negative timer
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [targetTime, isNegative, onComplete]);

  const formatTime = (time) => {
    const totalSeconds = Math.abs(Math.floor(time / 1000)); // Get total seconds
    const hours = Math.floor(totalSeconds / 3600); // Calculate hours
    const minutes = Math.floor((totalSeconds % 3600) / 60); // Calculate minutes
    const seconds = totalSeconds % 60; // Calculate seconds

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        fontSize: '24px',
        fontWeight: isNegative ? 'bold' : 'normal',
        color: isNegative ? 'red' : 'black',
      }}
    >
      {formatTime(timeLeft)}
    </div>
  );
};

export default CountdownTimer;
