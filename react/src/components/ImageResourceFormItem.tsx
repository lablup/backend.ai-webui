import { useResourceSlotsDetails } from '../hooks/backendai';
import DynamicUnitInputNumberWithSlider from './DynamicUnitInputNumberWithSlider';
import InputNumberWithSlider from './InputNumberWithSlider';
import { Form, theme } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface imageResourceProps {
  key: string;
  min: string | null;
  max: string | null;
}
interface Props extends Omit<imageResourceProps, 'key'> {
  name: string;
}

interface resourceInfoType {
  [key: string]: {
    label: string;
    inputNumberProps?: any;
    sliderProps?: any;
    min: string;
    max: string;
    step?: number | null;
    dynamicUnitChange?: boolean;
  };
}

const ImageResourceFormItem: React.FC<Props> = ({ name, min, max }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [resourceSlotsDetails] = useResourceSlotsDetails();
  console.log(resourceSlotsDetails);
  const resourceInfo: resourceInfoType = {
    cpu: {
      label: 'CPU',
      inputNumberProps: {
        addonAfter: t('session.launcher.Core'),
      },
      sliderProps: {
        marks: { 0: '0', 8: '8' },
      },
      min: '0',
      max: '8',
      step: 1,
    },
    mem: {
      label: 'MEM',
      inputNumberProps: {
        addonBefore: 'Mem',
      },
      min: '0m',
      max: '512g',
      dynamicUnitChange: true,
    },
    cuda_device: {
      label: 'CUDA GPU',
      min: '0',
      max: '7',
      sliderProps: {
        marks: { 0: '0', 7: '7' },
      },
    },
    cuda_shares: {
      label: 'CUDA FGPU',
      min: '0',
      max: '8',
      sliderProps: {
        marks: {
          0.1: '0.1',
          0.2: ' ',
          0.5: ' ',
          1.0: ' ',
          2.0: ' ',
          4.0: ' ',
          8.0: '8.0',
        },
      },
      step: null,
    },
    rocm_devide: {
      label: 'ROCm GPU',
      min: '0',
      max: '7',
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
    },
    tpu_device: {
      label: 'TPU',
      min: '0',
      max: '4',
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
    },
    ipu_device: {
      label: 'IPU',
      min: '0',
      max: '4',
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
    },
    atom_device: {
      label: 'ATOM',
      min: '0',
      max: '4',
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
    },
    warboy_device: {
      label: 'Warboy',
      min: '0',
      max: '4',
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
    },
    hyperaccel_lpu_device: {
      label: 'Hyperaccel LPU',
      min: '0',
      max: '5',
      sliderProps: {
        marks: { 0: '0', 5: '5' },
      },
    },
  };

  return (
    <Form.Item
      name={[name]}
      //@ts-ignore
      label={resourceInfo[name]?.label}
      initialValue={min}
      style={{ marginBottom: token.marginXXS }}
    >
      {/* @ts-ignore */}
      {resourceInfo[name]?.dynamicUnitChange ? (
        <DynamicUnitInputNumberWithSlider
          max={'512g'}
          min={'0m'}
          addonBefore={'MEM'}
        />
      ) : (
        <InputNumberWithSlider
          min={parseFloat(resourceInfo[name]?.min)}
          max={parseFloat(resourceInfo[name]?.max)}
          step={resourceInfo[name]?.step}
          inputNumberProps={resourceInfo[name]?.inputNumberProps}
          sliderProps={resourceInfo[name]?.sliderProps}
        />
      )}
    </Form.Item>
  );
};

export default ImageResourceFormItem;
