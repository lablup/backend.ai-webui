import { ModelCloneModalVFolderFragment$key } from '../__generated__/ModelCloneModalVFolderFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import BAIModal, { BAIModalProps } from './BAIModal';
import StorageSelect from './StorageSelect';
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
import {
  BAIFlex,
  ESMClientErrorResponse,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

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
        row_id
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
  const { getErrorMessage } = useErrorMessageResolver();
  const { upsertNotification } = useSetBAINotification();

  const [extraNameError, setExtraNameError] = useState<
    Pick<FormItemProps, 'validateStatus' | 'help'>
  >({});

  const mutationToClone = useTanMutation<
    {
      bgtask_id: string;
      id: string;
    },
    ESMClientErrorResponse,
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
      confirmLoading={mutationToClone.isPending}
      onOk={(e) => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            if (vfolder?.row_id && vfolder.host) {
              mutationToClone.mutate(
                {
                  input: values,
                  name: vfolder.row_id,
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
                        onChange: {
                          pending: t('data.folders.FolderClonePending'),
                          resolved: t('data.folders.FolderCloned'),
                          rejected: t('data.folders.FolderCloneFailed'),
                        },
                      },
                      message: values.target_name,
                      toText: t('data.folders.OpenAFolder'),
                      to: {
                        pathname: '/data',
                        search: new URLSearchParams({
                          tab: 'model',
                          folder: data.id,
                        }).toString(),
                      },
                    });
                    props.onOk?.(e);
                  },
                  onError(error) {
                    if (
                      error.message?.includes(
                        'The virtual folder already exists with the same name',
                      )
                    ) {
                      setExtraNameError({
                        validateStatus: 'error',
                        help: t('modelStore.FolderAlreadyExists'),
                      });
                    } else {
                      message.error(getErrorMessage(error));
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
      <BAIFlex direction="column" align="stretch" gap="sm">
        <Alert showIcon type="info" message={t('modelStore.CloneInfo')} />
        <Form
          ref={formRef}
          layout="vertical"
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
                message: t('data.AllowsLettersNumbersAnd-_Dot'),
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
              ]}
            />
          </Form.Item>
          <Form.Item hidden name="cloneable" valuePropName="checked">
            <Switch checked={false} />
          </Form.Item>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default ModelCloneModal;
