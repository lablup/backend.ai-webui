import { addNumberWithUnits, compareNumberWithUnits } from '../helper';
import DynamicUnitInputNumberWithSlider from './DynamicUnitInputNumberWithSlider';
import InputNumberWithSlider from './InputNumberWithSlider';
import { AUTOMATIC_DEFAULT_SHMEM } from './ResourceAllocationFormItems';
import { Form, theme } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface imageResourceProps {
  key: string;
  min: string | null;
  max: string | null;
}
interface Props extends Omit<imageResourceProps, 'key'> {
  name: string;
}

const ImageResourceFormItem: React.FC<Props> = ({ name, min, max }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  if (name === 'cpu') {
    return (
      <Form.Item
        name={['cpu']}
        label={'CPU'}
        initialValue={min}
        style={{ marginBlock: token.marginXS }}
      >
        <InputNumberWithSlider
          inputNumberProps={{
            addonAfter: t('session.launcher.Core'),
          }}
          sliderProps={{
            marks: { 0: '0', 8: '8' },
          }}
          min={0}
          max={8}
          step={1}
        />
      </Form.Item>
    );
  }
  if (name === 'mem') {
    return (
      <Form.Item
        name={['mem']}
        label={'Memory'}
        initialValue={min}
        style={{ marginBlock: token.marginXS }}
      >
        <DynamicUnitInputNumberWithSlider
          max={'512g'}
          min={'0m'}
          addonBefore={'MEM'}
        />
      </Form.Item>
    );
  }
  if (name === 'cuda_device') {
    return (
      <Form.Item
        name={['cuda_device']}
        label={'CUDA GPU'}
        initialValue={min}
        style={{ marginBlock: token.marginXS }}
      >
        <InputNumberWithSlider
          inputNumberProps={{
            addonAfter: 'GPU',
          }}
          sliderProps={{
            marks: { 0: '0', 8: '8' },
          }}
          min={0}
          max={8}
          step={1}
        />
      </Form.Item>
    );
  }
  if (name === 'cuda_shares') {
    return (
      // FIXME : step count should be 0, 0.1, 0.2, 0.5, 1, 2, 4, 8
      <Form.Item
        name={['cuda_shares']}
        label={'CUDA FGPU'}
        initialValue={min}
        style={{ marginBlock: token.marginXS }}
      >
        <InputNumberWithSlider
          inputNumberProps={{
            addonAfter: 'FGPU',
          }}
          sliderProps={{
            marks: { 0: '0', 8: '8' },
          }}
          min={0}
          max={8}
          step={1}
        />
      </Form.Item>
    );
  }
};

export default ImageResourceFormItem;
