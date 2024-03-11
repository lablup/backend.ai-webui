import { Chart } from '@antv/g2';
import React, { useEffect, useRef, useState } from 'react';

interface BAIColumnChartProps {
  id: string;
  title?: string;
  data: Array<Record<string, unknown>>;
}

const BAIColumnChart: React.FC<BAIColumnChartProps> = ({
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
        // width: 1200,
        title: title,
      });

      newChartInstance
        .interval()
        .data(data)
        .encode('x', 'date')
        .encode('y', 'utilization')
        .encode('color', 'name')
        .transform({ type: 'dodgeX' });
      // .scale('x', {
      //   range: [0, 1],
      // });

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

export default BAIColumnChart;
