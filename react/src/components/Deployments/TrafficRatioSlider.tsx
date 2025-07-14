import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Slider, InputNumber, Button, Space, Alert } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useState, useEffect } from 'react';

interface TrafficRatio {
  id: string;
  name: string;
  currentRatio: number;
}

interface TrafficRatioSliderProps {
  ratios: TrafficRatio[];
  onSave: (updatedRatios: TrafficRatio[]) => void;
  onCancel: () => void;
  editing: boolean;
}

const TrafficRatioSlider: React.FC<TrafficRatioSliderProps> = ({
  ratios,
  onSave,
  onCancel,
  editing,
}) => {
  const [tempRatios, setTempRatios] = useState<TrafficRatio[]>(ratios);
  const [totalRatio, setTotalRatio] = useState(0);

  useEffect(() => {
    const total = tempRatios.reduce(
      (sum, ratio) => sum + ratio.currentRatio,
      0,
    );
    setTotalRatio(total);
  }, [tempRatios]);

  const handleRatioChange = (id: string, value: number) => {
    setTempRatios((prev) =>
      prev.map((ratio) =>
        ratio.id === id ? { ...ratio, currentRatio: value } : ratio,
      ),
    );
  };

  const handleSave = () => {
    if (totalRatio === 100) {
      onSave(tempRatios);
    }
  };

  const handleAutoBalance = () => {
    const averageRatio = Math.floor(100 / tempRatios.length);
    const remainder = 100 % tempRatios.length;

    setTempRatios((prev) =>
      prev.map((ratio, index) => ({
        ...ratio,
        currentRatio: averageRatio + (index < remainder ? 1 : 0),
      })),
    );
  };

  if (!editing) {
    return (
      <BAIFlex direction="column" gap="sm">
        {ratios.map((ratio) => (
          <BAIFlex key={ratio.id} justify="between" align="center">
            <span>{ratio.name}</span>
            <span>{ratio.currentRatio}%</span>
          </BAIFlex>
        ))}
      </BAIFlex>
    );
  }

  return (
    <BAIFlex direction="column" gap="md">
      <Alert
        message={`Total: ${totalRatio}%`}
        type={totalRatio === 100 ? 'success' : 'warning'}
        showIcon
        style={{ marginBottom: 16 }}
      />

      {tempRatios.map((ratio) => (
        <BAIFlex key={ratio.id} align="center" gap="md">
          <span style={{ minWidth: 120 }}>{ratio.name}</span>
          <Slider
            min={0}
            max={100}
            value={ratio.currentRatio}
            onChange={(value) => handleRatioChange(ratio.id, value)}
            style={{ flex: 1 }}
          />
          <InputNumber
            min={0}
            max={100}
            value={ratio.currentRatio}
            onChange={(value) => handleRatioChange(ratio.id, value || 0)}
            addonAfter="%"
            style={{ width: 80 }}
          />
        </BAIFlex>
      ))}

      <BAIFlex justify="between" align="center">
        <Button size="small" onClick={handleAutoBalance}>
          Auto Balance
        </Button>
        <Space>
          <Button size="small" icon={<CloseOutlined />} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleSave}
            disabled={totalRatio !== 100}
          >
            Save
          </Button>
        </Space>
      </BAIFlex>
    </BAIFlex>
  );
};

export default TrafficRatioSlider;
