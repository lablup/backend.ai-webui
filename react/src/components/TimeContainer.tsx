import { default as dayjs } from 'dayjs';
import React, { useState, useEffect } from 'react';

interface TimeContainerProps {}

const TimeContainer: React.FC<TimeContainerProps> = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => {
      clearInterval(timer);
    };
  });

  return (
    <>
      <p>{dayjs(date).format('YYYY/MM/DD dddd HH:mm:ss')}</p>
    </>
  );
};

export default TimeContainer;
