import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { usePainKiller } from '../hooks/usePainKiller';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import StorageSelect from './StorageSelect';
import { ModelCloneModalVFolderFragment$key } from './__generated__/ModelCloneModalVFolderFragment.graphql';
import {
  Alert,
  Form,
  FormInstance,
  FormItemProps,
  Input,
  Select,
  Switch,
  message,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface ModelCloneModalProps extends BAIModalProps {
  vfolderNode: ModelCloneModalVFolderFragment$key | null;
}
const ModelCloneModal: React.FC<ModelCloneModalProps> = ({
  // sourceFolderName,
  // sourceFolderHost,
  vfolderNode,
  ...props
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const vfolder = useFragment(
    graphql`
      fragment ModelCloneModalVFolderFragment on VirtualFolderNode {
        id
        name
        host
      }
    `,
    vfolderNode,
  );
  const formRef = useRef<
    FormInstance<{
      target_name: string;
      target_host: string;
      permission: string;
      // type: string;
      // project: string;
      usage_mode: string;
    }>
  >(null);
  const painKiller = usePainKiller();
  const { upsertNotification } = useSetBAINotification();

  // const { data: allowed_vfolder_types } = useTanQuery({
  //   queryKey: ['modelCloneModal', 'vfolder_allowed_types'],
  //   queryFn: () => {
  //     return baiClient.vfolder.list_allowed_types();
  //   },
  // });

  const [extraNameError, setExtraNameError] = useState<
    Pick<FormItemProps, 'validateStatus' | 'help'>
  >({});

  const mutationToClone = useTanMutation<
    {
      bgtask_id: string;
    },
    { type?: string; title?: string; message?: string },
    {
      input: any;
      name: string;
    }
  >({
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
      onOk={(e) => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            if (vfolder?.name && vfolder.host) {
              mutationToClone.mutate(
                {
                  input: values,
                  name: vfolder.name,
                },
                {
                  onSuccess(data) {
                    upsertNotification({
                      key: 'modelStore.clone.' + vfolder.id,
                      open: true,
                      backgroundTask: {
                        status: 'pending',
                        percent: 0,
                        taskId: data.bgtask_id,
                        statusDescriptions: {
                          pending: t('data.folders.FolderClonePending'),
                          resolved: t('data.folders.FolderCloned'),
                          rejected: t('data.folders.FolderCloneFailed'),
                        },
                      },
                    });
                    console.log(data);
                    props.onOk?.(e);
                  },
                  onError(error) {
                    if (
                      error.type === 'https://api.backend.ai/probs/server-error'
                    ) {
                      setExtraNameError({
                        validateStatus: 'error',
                        help: t('modelStore.FolderAlreadyExists'),
                      });
                    } else {
                      const messageStr = painKiller.relieve(
                        error?.message || '',
                      );
                      message.error({
                        content: messageStr,
                      });
                    }
                  },
                },
              );
            } else {
            }
          })
          .catch(() => {});
      }}
    >
      <Flex direction="column" align="stretch" gap="sm">
        <Alert showIcon type="info" message={t('modelStore.CloneInfo')} />
        <Form
          ref={formRef}
          layout="vertical"
          requiredMark="optional"
          initialValues={{
            permission: 'rw',
            // project: currentProject.id,
            // type: 'user',
            usage_mode: 'model',
            target_name: vfolder?.name + '_1',
            target_host: vfolder?.host,
          }}
          scrollToFirstError
        >
          {/*  */}
          <Form.Item label={t('data.ExistingFolderName')} required>
            <Input value={vfolder?.name || ''} disabled />
          </Form.Item>
          <Form.Item
            name="target_name"
            label={t('data.NewFolderName')}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[a-zA-Z0-9._-]*$/,
                message: t('data.Allowslettersnumbersand-_dot'),
              },
            ]}
            {...extraNameError}
          >
            <Input
              autoComplete="off"
              onChange={() => {
                setExtraNameError({});
              }}
            />
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
            <StorageSelect disabled />
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
