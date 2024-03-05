import { Chart } from '@antv/g2';
import React, { useEffect, useRef, useState } from 'react';

interface BAILineChartProps {
  id: string;
  title?: string;
  data: Array<Record<string, unknown>>;
}

const BAIAreaChart: React.FC<BAILineChartProps> = ({
  data,
  title = '',
  id,
}) => {
  const chartContainer = useRef(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  useEffect(() => {
    if (chartContainer) {
      const newChartInstance = new Chart({
        container: id,
        autoFit: true,
        height: 300,
        width: 500,
        title: title,
      });

      newChartInstance
        .area()
        .data(data)
        .encode('x', 'date')
        .encode('y', 'utilization')
        .scale('x', {
          range: [0, 1],
        });

      newChartInstance.render();
      setChartInstance(newChartInstance);
    }
  }, [chartContainer, data]);
  return (
    <>
      <div id={id}></div>
    </>
  );
};

export default BAIAreaChart;
