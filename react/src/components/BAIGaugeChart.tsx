import { Chart } from '@antv/g2';
import React, { useState, useRef, useEffect } from 'react';

interface BAIGaugeChartProps {
  data: Record<string, unknown>;
  id?: string;
}

const BAIGaugeChart: React.FC<BAIGaugeChartProps> = ({ data, id }) => {
  const chartContainer = useRef(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  useEffect(() => {
    if (chartContainer) {
      const newChartInstance = new Chart({
        container: id,
        autoFit: true,
        height: 250,
        width: 250,
        margin: 0,
      });

      newChartInstance
        .gauge()
        .data(data)
        .style('textContent', (target: number) => `${target.toFixed(2)} %`)
        .legend(false);

      newChartInstance.render();
      setChartInstance(newChartInstance);
    }
  }, [chartContainer, data]);
  return (
    <div id={id} style={{ display: 'inline-block', margin: 'auto' }}></div>
  );
};

export default BAIGaugeChart;
