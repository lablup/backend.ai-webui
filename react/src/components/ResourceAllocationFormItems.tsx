import Flex from './Flex';
import ResourcePresetSelect from './ResourcePresetSelect';
import SliderInputItem from './SliderInputFormItem';
import { EditOutlined } from '@ant-design/icons';
import { Card, Checkbox, Form, Segmented, Select, theme } from 'antd';
import { Trans, useTranslation } from 'react-i18next';

const ResourceAllocationFormItems = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const form = Form.useFormInstance();
  Form.useWatch('customResourceAllocationType', form);
  return (
    <>
      <Form.Item
        labelCol={{ span: 24 }}
        label={
          <Flex
            direction="row"
            justify="between"
            gap={'xs'}
            style={{ width: '100%' }}
          >
            {t('session.launcher.ResourceAllocation')}
            <Form.Item
              name="customResourceAllocationType"
              noStyle
              valuePropName="checked"
            >
              <Checkbox>Custom</Checkbox>
            </Form.Item>
          </Flex>
        }
        name="allocationPreset"
        required
        style={{ marginBottom: token.marginXS }}
      >
        <ResourcePresetSelect />
      </Form.Item>
      <Card
        style={{
          marginBottom: token.margin,
        }}
        hidden={!form.getFieldValue('customResourceAllocationType')}
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
                  name={'cpu'}
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
                  name={'mem'}
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
                  name={'shmem'}
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
