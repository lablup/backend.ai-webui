import { iSizeToSize } from '../helper';
import { useResourceSlots } from '../hooks/backendai';
import ResourcePresetSelect from './ResourcePresetSelect';
import SliderInputItem from './SliderInputFormItem';
import { Card, Form, theme } from 'antd';
import _ from 'lodash';
import { Trans, useTranslation } from 'react-i18next';

const ResourceAllocationFormItems = () => {
  const form = Form.useFormInstance();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [resourceSlots] = useResourceSlots();

  // TODO: auto select preset

  return (
    <>
      <Form.Item
        label={t('resourcePreset.ResourcePresets')}
        name="allocationPreset"
        required
        style={{ marginBottom: token.marginXS }}
      >
        <ResourcePresetSelect
          onChange={(value, options) => {
            form.setFieldValue('selectedPreset', options?.preset);
            const slots = _.pick(
              JSON.parse(options?.preset?.resource_slots || '{}'),
              _.keys(resourceSlots),
            );
            form.setFieldValue('resource', {
              ...slots,
              mem: iSizeToSize((slots?.mem || 0) + 'b', 'g', 2).number,
              shmem: iSizeToSize(
                (options?.preset?.shared_memory || 0) + 'b',
                'g',
                2,
              ).number,
            });
          }}
        />
      </Form.Item>
      <Form.Item noStyle name="selectedPreset"></Form.Item>
      <Card
        style={{
          marginBottom: token.margin,
        }}
      >
        <Form.Item
          shouldUpdate={(prev, cur) =>
            prev.allocationPreset !== cur.allocationPreset
          }
          noStyle
        >
          {({ getFieldValue }) => {
            return (
              // getFieldValue('allocationPreset') === 'custom' && (
              <>
                <SliderInputItem
                  name={['resource', 'cpu']}
                  initialValue={0}
                  label={t('session.launcher.CPU')}
                  tooltip={<Trans i18nKey={'session.launcher.DescCPU'} />}
                  // min={parseInt(
                  //   _.find(
                  //     currentImage?.resource_limits,
                  //     (i) => i?.key === 'cpu',
                  //   )?.min || '0',
                  // )}
                  // max={parseInt(
                  //   _.find(
                  //     currentImage?.resource_limits,
                  //     (i) => i?.key === 'cpu',
                  //   )?.max || '100',
                  // )}
                  inputNumberProps={{
                    addonAfter: t('session.launcher.Core'),
                  }}
                  required
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                />
                <SliderInputItem
                  name={['resource', 'mem']}
                  initialValue={0}
                  label={t('session.launcher.Memory')}
                  tooltip={<Trans i18nKey={'session.launcher.DescMemory'} />}
                  max={30}
                  inputNumberProps={{
                    addonAfter: 'GB',
                  }}
                  step={0.05}
                  required
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                />
                <SliderInputItem
                  name={['resource', 'shmem']}
                  initialValue={0}
                  label={t('session.launcher.SharedMemory')}
                  tooltip={
                    <Trans i18nKey={'session.launcher.DescSharedMemory'} />
                  }
                  max={30}
                  step={0.1}
                  inputNumberProps={{
                    addonAfter: 'GB',
                  }}
                  required
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                />
              </>
            );
          }}
        </Form.Item>
      </Card>
    </>
  );
};

export default ResourceAllocationFormItems;
