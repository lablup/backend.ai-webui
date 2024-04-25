import { useResourceSlotsDetails } from '../hooks/backendai';
import Flex from './Flex';
import NonLinearSlider, { StepType } from './NonLinearSlider';
import { Form, Input, theme } from 'antd';
import React from 'react';

interface resourceInfoType {
  [key: string]: {
    label?: string;
    inputNumberProps?: any;
    sliderProps?: any;
    steps: StepType[];
  };
}
export interface imageResourceProps {
  key: string;
  min: string | null;
  max: string | null;
}
interface ImageResourceFormItemProps extends Omit<imageResourceProps, 'key'> {
  name: string;
}

const ImageResourceFormItem: React.FC<ImageResourceFormItemProps> = ({
  name,
  min,
  max,
}) => {
  const { token } = theme.useToken();

  const [resourceSlotsDetails] = useResourceSlotsDetails();

  const resourceInfo: resourceInfoType = {
    cpu: {
      label: resourceSlotsDetails?.cpu.description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.cpu.display_unit,
      },
      steps: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
    },
    mem: {
      label: resourceSlotsDetails?.mem.description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.mem.human_readable_name,
      },
      steps: [
        '64m',
        '128m',
        '256m',
        '512m',
        '1g',
        '2g',
        '4g',
        '8g',
        '16g',
        '32g',
        '64g',
        '128g',
        '256g',
        '512g',
      ],
    },
    cuda_device: {
      label: resourceSlotsDetails?.['cuda.device'].description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.['cuda.device'].display_unit,
      },
      steps: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
    },
    cuda_shares: {
      label: resourceSlotsDetails?.['cuda.shares'].description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.['cuda.shares'].display_unit,
      },
      steps: ['0.1', '0.2', '0.5', '1.0', '2.0', '4.0', '8.0'],
    },
    rocm_devide: {
      label: resourceSlotsDetails?.['rocm.device'].description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.['rocm.device'].display_unit,
      },
      steps: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
    },
    tpu_device: {
      label: resourceSlotsDetails?.['tpu.device'].description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.['tpu.device'].display_unit,
      },
      steps: ['0', '1', '2', '3', '4'],
    },
    ipu_device: {
      label: resourceSlotsDetails?.['ipu.device'].description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.['ipu.device'].display_unit,
      },
      steps: ['0', '1', '2', '3', '4'],
    },
    atom_device: {
      label: resourceSlotsDetails?.atom.description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.atom.display_unit,
      },
      steps: ['0', '1', '2', '3', '4'],
    },
    warboy_device: {
      label: resourceSlotsDetails?.warboy.description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.warboy.display_unit,
      },
      steps: ['0', '1', '2', '3', '4'],
    },
    hyperaccel_lpu_device: {
      label: resourceSlotsDetails?.['hyperaccel-lpu'].description,
      inputNumberProps: {
        addonAfter: resourceSlotsDetails?.['hyperaccel-lpu'].display_unit,
      },
      steps: ['0', '1', '2', '3', '4'],
    },
  };

  return (
    <Form.Item
      name={[name]}
      label={resourceInfo[name]?.label ?? name.toUpperCase()}
      initialValue={min}
      style={{ marginBottom: token.marginXXS }}
    >
      <Flex gap={token.paddingMD}>
        <Form.Item
          shouldUpdate={(prevValues, currentValues) =>
            prevValues[name] !== currentValues[name]
          }
          noStyle
        >
          {({ getFieldValue, setFieldsValue }) => (
            <>
              <Input
                style={{ flex: 1 }}
                {...resourceInfo[name]?.inputNumberProps}
                value={getFieldValue([name])}
                onChange={(e) => setFieldsValue({ [name]: e.target.value })}
              />
              <NonLinearSlider
                style={{ flex: 2 }}
                steps={resourceInfo[name]?.steps}
                value={getFieldValue([name])}
                onChange={(value) => setFieldsValue({ [name]: value })}
              />
            </>
          )}
        </Form.Item>
      </Flex>
    </Form.Item>
  );
};

export default ImageResourceFormItem;
