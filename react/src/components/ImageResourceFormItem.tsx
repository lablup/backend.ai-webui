import { useResourceSlotsDetails } from '../hooks/backendai';
import Flex from './Flex';
import NonLinearSlider from './NonLinearSlider';
import { Divider, Form, Input, theme } from 'antd';
import _ from 'lodash';
import React from 'react';

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

  const getResourceInfo = (type: string) => {
    return (
      {
        cpu: {
          label: resourceSlotsDetails?.cpu.description,
          steps: _.map(
            ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
            (value) => ({
              value,
              label: `${value} ${resourceSlotsDetails?.cpu.display_unit}`,
            }),
          ),
        },
        mem: {
          label: resourceSlotsDetails?.mem.description,
          steps: _.map(
            [
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
            (v) => ({
              value: v,
              label: `${v.slice(0, -1)} ${_.toUpper(_.last(v))}iB`,
            }),
          ),
        },
        'cuda.device': {
          label: resourceSlotsDetails?.['cuda.device'].description,
          steps: _.map(['0', '1', '2', '3', '4', '5', '6', '7', '8'], (v) => ({
            value: v,
            label: `${v} ${resourceSlotsDetails?.['cuda.device'].display_unit}`,
          })),
        },
        'cuda.shares': {
          label: resourceSlotsDetails?.['cuda.shares'].description,
          steps: _.map(
            ['0', '0.1', '0.2', '0.5', '1.0', '2.0', '4.0', '8.0'],
            (v) => ({
              value: v,
              label: `${v} ${resourceSlotsDetails?.['cuda.shares'].display_unit}`,
            }),
          ),
        },
        'rocm.device': {
          label: resourceSlotsDetails?.['rocm.device'].description,
          steps: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
        },
      }[type] || {
        label: resourceSlotsDetails?.[type]?.description,
        steps: _.map(['0', '1', '2', '3', '4'], (v) => ({
          value: v,
          label: `${v} ${resourceSlotsDetails?.[type]?.display_unit || ''}`,
        })),
      }
    );
  };

  const formInstance = Form.useFormInstance();
  const value = Form.useWatch(name, formInstance);

  const stepForValue = _.find(getResourceInfo(name).steps, (step) => {
    // @ts-ignore
    return step.value === value || step === value;
  });

  return (
    <Form.Item
      label={getResourceInfo(name)?.label ?? name.toUpperCase()}
      style={{ flex: 1 }}
    >
      <Flex direction="row" gap={'lg'}>
        <Input
          size="large"
          variant="borderless"
          readOnly
          // @ts-ignore
          value={stepForValue?.label ?? stepForValue}
          style={{ flex: 1, fontSize: token.fontSizeLG }}
          tabIndex={-1}
        />
        <Divider type="vertical" style={{ height: 40 }} />
        <Form.Item name={name} noStyle initialValue={min}>
          <NonLinearSlider
            style={{ flex: 5 }}
            steps={getResourceInfo(name)?.steps}
            // onChange={(value) => {}}
          />
        </Form.Item>
      </Flex>
    </Form.Item>
  );
};

export default ImageResourceFormItem;
