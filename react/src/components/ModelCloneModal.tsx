import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { usePainKiller } from '../hooks/usePainKiller';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import StorageSelector from './StorageSelector';
import { Alert, Form, Input, Select, Switch, message } from 'antd';
import { useTranslation } from 'react-i18next';

interface ModelCloneModalProps extends BAIModalProps {
  sourceFolderName: string;
  sourceFolderHost: string;
}
const ModelCloneModal: React.FC<ModelCloneModalProps> = ({
  sourceFolderName,
  sourceFolderHost,
  ...props
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const [form] = Form.useForm();
  const painKiller = usePainKiller();

  // const { data: allowed_vfolder_types } = useTanQuery({
  //   queryKey: ['modelCloneModal', 'vfolder_allowed_types'],
  //   queryFn: () => {
  //     return baiClient.vfolder.list_allowed_types();
  //   },
  // });

  const mutationToClone = useTanMutation({
    // @ts-ignore
    mutationFn: ({ input, name }: { input: any; name: string }) => {
      return baiClient.vfolder.clone(input, name);
    },
  });

  return (
    <BAIModal
      destroyOnClose
      {...props}
      okText={t('button.Clone')}
      confirmLoading={mutationToClone.isLoading}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            mutationToClone.mutate(
              {
                input: values,
                name: sourceFolderName,
              },
              {
                onSuccess(data) {
                  message.info({
                    content: t('modelStore.CloneSuccess'),
                  });
                  props.onOk?.(data);
                },
                onError(error: any) {
                  // const title = painKiller.relieve(error?.title);
                  const messageStr = painKiller.relieve(error?.message);
                  message.error({
                    content: messageStr,
                  });
                },
              },
            );
          })
          .catch(() => {});
      }}
    >
      <Flex direction="column" align="stretch" gap="sm">
        <Alert showIcon type="info" message={t('modelStore.CloneInfo')} />
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          initialValues={{
            permission: 'rw',
            // project: currentProject.id,
            // type: 'user',
            usage_mode: 'model',
            target_name: sourceFolderName + '_1',
            target_host: sourceFolderHost,
          }}
        >
          <Form.Item label={t('data.ExistingFolderName')} required>
            <Input value={sourceFolderName} disabled />
          </Form.Item>
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
            tooltip={t('data.CloningIsOnlyPossibleSameHost')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <StorageSelector value={sourceFolderHost} disabled />
          </Form.Item>
          {/* <Form.Item
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
                <ProjectSelector
                  domain={currentDomain}
                  onSelectProject={() => {}}
                  autoSelectDefault
                  disabled={form.getFieldValue('type') !== 'group'}
                />
              </Form.Item>
            );
          }}
        </Form.Item> */}

          {/* _vfolderInnatePermissionSupport */}
          {baiClient.isAPIVersionCompatibleWith('v4.20191215') && (
            <Form.Item
              // label={t('data.UsageMode')}
              name={'usage_mode'}
              hidden
            >
              <Input />
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
          <Form.Item
            label={t('data.Permission')}
            name={'permission'}
            rules={[
              {
                required: true,
              },
            ]}
          >
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
      </Flex>
    </BAIModal>
  );
};

export default ModelCloneModal;
