import {
  useCurrentDomainValue,
  useCurrentProjectValue,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import ProjectSelector from './ProjectSelector';
import StorageSelector from './StorageSelector';
import { Form, Input, Select, Switch } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

interface ModelCloneModalProps extends BAIModalProps {}
const ModelCloneModal: React.FC<ModelCloneModalProps> = ({ ...props }) => {
  const { t } = useTranslation();
  const currentDomain = useCurrentDomainValue();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
  const [form] = Form.useForm();

  const { data: allowed_vfolder_types } = useTanQuery({
    queryKey: ['modelCloneModal', 'vfolder_allowed_types'],
    queryFn: () => {
      return baiClient.vfolder.list_allowed_types();
    },
  });

  const mutationToClone = useTanMutation({
    // @ts-ignore
    mutationFn: (input: any, name: string) => {
      return baiClient.vfolder.clone(input, name);
    },
  });

  return (
    <BAIModal
      destroyOnClose
      {...props}
      okText={t('button.Clone')}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            alert(JSON.stringify(values, null, 2));
          })
          .catch(() => {});
      }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={{
          permission: 'rw',
          project: currentProject.id,
          type: 'user',
        }}
      >
        <Form.Item
          name="target_name"
          label={t('data.Foldername')}
          rules={[
            {
              required: true,
            },
            {
              pattern: /^[a-zA-Z0-9._-]*$/,
              message: t('data.Allowslettersnumbersand-_dot'),
            },
          ]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="target_host"
          label={t('data.Host')}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <StorageSelector autoSelectDefault />
        </Form.Item>
        <Form.Item
          name="type"
          label={t('data.Type')}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            options={_.map(allowed_vfolder_types, (type) => {
              return {
                label:
                  {
                    user: t('data.User'),
                    group: t('data.Project'),
                  }[type] || type,
                value: type,
              };
            })}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, next) => prev.type !== next.type}
        >
          {() => {
            return (
              <Form.Item
                name="project"
                label={t('data.Project')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                {/* TODO: refactor PrjectSelector */}
                <ProjectSelector
                  domain={currentDomain}
                  onSelectProject={() => {}}
                  autoSelectDefault
                  disabled={form.getFieldValue('type') !== 'group'}
                />
              </Form.Item>
            );
          }}
        </Form.Item>

        {/* _vfolderInnatePermissionSupport */}
        {baiClient.isAPIVersionCompatibleWith('v4.20191215') && (
          <Form.Item
            // label={t('data.UsageMode')}
            name={'usage_mode'}
            hidden
          >
            <Input value={'model'} />
            {/* <Select
              options={[
                {
                  label: 'General',
                  value: 'general',
                },
                ...(baiClient.supports('inference-workload')
                  ? [
                      {
                        label: 'Model',
                        value: 'model',
                      },
                    ]
                  : []),
              ]}
            /> */}
          </Form.Item>
        )}
        <Form.Item label={t('data.Permission')} name={'permission'}>
          <Select
            options={[
              {
                label: 'Read-Write',
                value: 'rw',
              },
              {
                label: 'Read-Only',
                value: 'ro',
              },
              {
                label: 'Delete',
                value: 'wd',
              },
            ]}
          />
        </Form.Item>
        <Form.Item hidden name="cloneable" valuePropName="checked">
          <Switch checked={false} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default ModelCloneModal;
