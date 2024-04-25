import { useResourceSlotsDetails } from '../hooks/backendai';
import DynamicUnitInputNumberWithSlider from './DynamicUnitInputNumberWithSlider';
import InputNumberWithSlider from './InputNumberWithSlider';
import { Form, theme } from 'antd';
import React from 'react';

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
    label?: string;
    inputNumberProps?: any;
    sliderProps?: any;
    min: string;
    max: string;
    step?: number | null;
    dynamicUnitChange?: boolean;
  };
}
const DEFAULT_PROCESS_UNIT = { min: '0', max: '8' };
const MEMORY_UNIT = { min: '0m', max: '512g' };
const ACCELATOR_UNIT = { min: '0', max: '4' };

const ImageResourceFormItem: React.FC<Props> = ({ name, min, max }) => {
  const { token } = theme.useToken();

  const [resourceSlotsDetails] = useResourceSlotsDetails();

  const resourceInfo: resourceInfoType = {
    cpu: {
      label: resourceSlotsDetails?.cpu.description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.cpu.display_unit,
      },
      sliderProps: {
        marks: { 0: '0', 8: '8' },
      },
      step: 1,
      ...DEFAULT_PROCESS_UNIT,
    },
    mem: {
      label: resourceSlotsDetails?.mem.description,
      inputNumberProps: {
        addonBefore: resourceSlotsDetails?.mem.human_readable_name,
      },
      dynamicUnitChange: true,
      ...MEMORY_UNIT,
    },
    cuda_device: {
      label: resourceSlotsDetails?.['cuda.device'].description,
      sliderProps: {
        marks: { 0: '0', 8: '8' },
      },
      step: 1,
      ...DEFAULT_PROCESS_UNIT,
    },
    cuda_shares: {
      label: resourceSlotsDetails?.['cuda.shares'].description,
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
      ...DEFAULT_PROCESS_UNIT,
    },
    rocm_devide: {
      label: resourceSlotsDetails?.['rocm.device'].description,
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
      step: 1,
      ...ACCELATOR_UNIT,
    },
    tpu_device: {
      label: resourceSlotsDetails?.['tpu.device'].description,
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
      step: 1,
      ...ACCELATOR_UNIT,
    },
    ipu_device: {
      label: resourceSlotsDetails?.['ipu.device'].description,
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
      step: 1,
      ...ACCELATOR_UNIT,
    },
    atom_device: {
      label: resourceSlotsDetails?.atom.description,
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
      step: 1,
      ...ACCELATOR_UNIT,
    },
    warboy_device: {
      label: resourceSlotsDetails?.warboy.description,
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
      step: 1,
      ...ACCELATOR_UNIT,
    },
    hyperaccel_lpu_device: {
      label: resourceSlotsDetails?.['hyperaccel-lpu'].description,
      sliderProps: {
        marks: { 0: '0', 4: '4' },
      },
      step: 1,
      ...ACCELATOR_UNIT,
    },
  };

  return (
    <Form.Item
      name={[name]}
      //@ts-ignore
      label={resourceInfo[name]?.label ?? name.toUpperCase()}
      initialValue={min}
      style={{ marginBottom: token.marginXXS }}
    >
      {/* @ts-ignore */}
      {resourceInfo[name]?.dynamicUnitChange ? (
        <DynamicUnitInputNumberWithSlider
          addonBefore={resourceInfo[name]?.inputNumberProps.addonBefore}
          {...MEMORY_UNIT}
        />
      ) : (
        <InputNumberWithSlider
          min={parseFloat(resourceInfo[name]?.min)}
          max={parseFloat(resourceInfo[name]?.max)}
          step={resourceInfo[name]?.step ?? null}
          inputNumberProps={resourceInfo[name]?.inputNumberProps}
          sliderProps={resourceInfo[name]?.sliderProps}
        />
      )}
    </Form.Item>
  );
};

export default ImageResourceFormItem;
