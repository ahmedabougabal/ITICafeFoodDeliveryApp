import React, { useEffect, useState } from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Progress, Typography } from 'antd';

interface Props {
  initTime: Date;
  preparation: number; // Preparation time in minutes
}

const App: React.FC<Props> = ({ initTime, preparation }) => {
  const initialTime = new Date(initTime);
  const targetTime = new Date(initialTime.getTime() + preparation * 60 * 1000);
  
  const [percent, setPercent] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(targetTime.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timeLeft = targetTime.getTime() - currentTime;

      if (timeLeft <= 0) {
        setPercent(100);
        setRemainingTime(0);
        clearInterval(interval); // Clear interval when time is up
      } else {
        const newPercent = ((preparation * 60 * 1000 - timeLeft) / (preparation * 60 * 1000)) * 100;
        setPercent(newPercent);
        setRemainingTime(timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [targetTime, preparation]);

  const formatTime = (time: number) => {
    const totalSeconds = Math.floor(time / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div>
      <Progress percent={Math.floor(percent)} type="line" />
    </div>
  );
};

export default App;
