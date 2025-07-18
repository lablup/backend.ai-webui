import { useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import ProjectSelect from './ProjectSelect';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import StorageSelect from './StorageSelect';
import {
  App,
  Button,
  Divider,
  Form,
  Input,
  Radio,
  Skeleton,
  Switch,
  theme,
} from 'antd';
import { createStyles } from 'antd-style';
import { FormInstance } from 'antd/lib';
import _ from 'lodash';
import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  modal: css`
    .ant-modal-body {
      padding-top: 24px !important;
      padding-bottom: 0 !important;
    }
  `,
  form: css`
    .ant-form-item-label {
      display: flex;
      align-items: start;
      padding-left: var(--token-paddingSM);
    }
    .ant-form-item .ant-form-item-label > label {
      flex-direction: row-reverse !important;
      gap: var(--token-paddingXS);
    }
    .ant-form-item-control {
      padding-right: var(--token-paddingSM);
    }
    .ant-form-item-label > label::after {
      display: none !important;
    }
  `,
}));
interface FolderCreateFormItemsType {
  name: string;
  host: string | undefined;
  group: string | undefined;
  usage_mode: 'general' | 'model' | 'automount';
  type: 'user' | 'project';
  permission: 'rw' | 'ro';
  cloneable: boolean;
}

interface FolderCreateModalProps extends BAIModalProps {
  onRequestClose: (response?: FolderCreationResponse) => void;
  usageMode?: 'general' | 'model' | 'automount';
}
export interface FolderCreationResponse {
  id: string;
  name: string;
  quota_scope_id: string;
  host: string;
  usage_mode: 'general' | 'model' | 'automount';
  permission: 'rw' | 'ro';
  max_size: number;
  creator: string;
  ownership_type: 'user' | 'project';
  user: string;
  group: string | null;
  cloneable: boolean;
  status: string;
}

const FolderCreateModal: React.FC<FolderCreateModalProps> = ({
  onRequestClose,
  usageMode,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const formRef = useRef<FormInstance>(null);
  const baiClient = useSuspendedBackendaiClient();
  const userRole = useCurrentUserRole();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();

  const { upsertNotification } = useSetBAINotification();

  const baiRequestWithPromise = useBaiSignedRequestWithPromise();

  const { data: allowedTypes, isFetching: isFetchingAllowedTypes } =
    useTanQuery({
      queryKey: ['allowedTypes', modalProps.open],
      enabled: modalProps.open,
      queryFn: () =>
        modalProps.open ? baiClient.vfolder.list_allowed_types() : undefined,
    });

  const mutationToCreateFolder = useTanMutation<
    FolderCreationResponse,
    { message?: string },
    FolderCreateFormItemsType
  >({
    mutationFn: (values) => {
      const body = {
        ...values,
        cloneable: !!values.cloneable,
        usage_mode:
          values.usage_mode === 'automount' ? 'general' : values.usage_mode,
        name:
          values.usage_mode === 'automount' && !_.startsWith(values.name, '.')
            ? `.${values.name}`
            : values.name,
      };
      return baiRequestWithPromise({
        method: 'POST',
        url: '/folders',
        body: body,
      });
    },
  });

  const INITIAL_FORM_VALUES: FolderCreateFormItemsType = {
    name: '',
    host: undefined,
    group: currentProject.name,
    usage_mode: usageMode ?? 'general',
    type: 'user',
    permission: 'rw',
    cloneable: false,
  };

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        mutationToCreateFolder.mutate(values, {
          onSuccess: (result) => {
            upsertNotification({
              key: 'folder-create-success',
              icon: 'folder',
              message: `${result.name}: ${t('data.folders.FolderCreated')}`,
              toText: t('data.folders.OpenAFolder'),
              to: {
                search: new URLSearchParams({
                  folder: result.id,
                }).toString(),
              },
              open: true,
            });
            document.dispatchEvent(
              new CustomEvent('backend-ai-folder-list-changed'),
            );
            document.dispatchEvent(
              new CustomEvent('backend-ai-folder-created'),
            );
            onRequestClose(result);
          },
          onError: (error) => {
            message.error(error.message);
          },
        });
      })
      .catch((error) => console.log(error));
  };

  return (
    <BAIModal
      loading={isFetchingAllowedTypes}
      className={styles.modal}
      title={t('data.CreateANewStorageFolder')}
      footer={
        <Flex justify="between">
          <Button
            danger
            onClick={() => {
              formRef.current?.resetFields();
            }}
          >
            {t('button.Reset')}
          </Button>
          <Flex gap={token.marginSM}>
            <Button
              onClick={() => {
                onRequestClose();
              }}
            >
              {t('button.Cancel')}
            </Button>
            <Button
              type="primary"
              data-testid="create-folder-button"
              onClick={() => {
                handleOk();
              }}
            >
              {t('data.Create')}
            </Button>
          </Flex>
        </Flex>
      }
      width={650}
      okButtonProps={{ loading: mutationToCreateFolder.isPending }}
      onCancel={() => {
        onRequestClose();
      }}
      destroyOnClose
      {...modalProps}
    >
      <Form
        className={styles.form}
        ref={formRef}
        initialValues={INITIAL_FORM_VALUES}
        labelCol={{ span: 8 }}
      >
        <Form.Item label={t('data.UsageMode')} name={'usage_mode'}>
          <Radio.Group
            onChange={() => {
              // Only validate name field if it has a value to prevent excessive validation
              if (formRef.current?.getFieldValue('name')) {
                formRef.current.validateFields(['name']);
              }
            }}
          >
            <Radio value={'general'} data-testid="general-usage-mode">
              {t('data.General')}
            </Radio>
            {baiClient._config.enableModelFolders ? (
              <Radio value={'model'} data-testid="model-usage-mode">
                {t('data.Models')}
              </Radio>
            ) : null}
            <Radio value={'automount'} data-testid="automount-usage-mode">
              <Flex gap="xxs">
                {t('data.AutoMount')}
                <QuestionIconWithTooltip
                  title={t('data.AutomountFolderCreationDesc')}
                />
              </Flex>
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Divider />

        <Form.Item
          label={t('data.Foldername')}
          name={'name'}
          // required check is handled in the name validator
          required
          rules={[
            {
              pattern: /^[a-zA-Z0-9-_.]+$/,
              message: t('data.AllowsLettersNumbersAnd-_Dot'),
            },
            {
              max: 64,
              message: t('data.FolderNameTooLong'),
            },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (_.isEmpty(value)) {
                  return Promise.reject(
                    new Error(t('data.FolderNameRequired')),
                  );
                }
                if (
                  getFieldValue('usage_mode') === 'automount' &&
                  !_.startsWith(value, '.')
                ) {
                  return Promise.reject(
                    new Error(t('data.AutomountFolderNameMustStartWithDot')),
                  );
                }
                if (
                  getFieldValue('usage_mode') !== 'automount' &&
                  _.startsWith(value, '.')
                ) {
                  return Promise.reject(
                    new Error(t('data.DotPrefixReservedForAutomount')),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input placeholder={t('maxLength.64chars')} />
        </Form.Item>
        <Divider />

        <Form.Item label={t('data.folders.Location')} name={'host'}>
          <Suspense fallback={<Skeleton.Input active />}>
            <StorageSelect
              onChange={(value) => {
                formRef.current?.setFieldValue('host', value);
              }}
              showUsageStatus
              autoSelectType="usage"
              showSearch
            />
          </Suspense>
        </Form.Item>
        <Divider />

        <Form.Item
          label={t('data.Type')}
          name={'type'}
          style={{ flex: 1, marginBottom: 0 }}
        >
          <Radio.Group>
            {/* Both checks are required:
             * - role check (admin/superadmin): Controls permission to create project folders
             * - allowedTypes check: Ensures the 'group' type is registered in ETCD
             * allowedTypes comes from ETCD and contains all registered types regardless of permissions,
             * so we need both checks for proper access control
             */}
            {_.includes(allowedTypes, 'user') ? (
              <Radio value={'user'} data-testid="user-type">
                {t('data.User')}
              </Radio>
            ) : null}
            {(userRole === 'admin' || userRole === 'superadmin') &&
            _.includes(allowedTypes, 'group') ? (
              <Radio value={'project'} data-testid="project-type">
                {t('data.Project')}
              </Radio>
            ) : null}
          </Radio.Group>
        </Form.Item>
        <Divider />

        <Suspense>
          <Form.Item dependencies={['type']} noStyle>
            {({ getFieldValue }) => {
              return (
                getFieldValue('type') === 'project' && (
                  <>
                    <Form.Item label={t('data.Project')} name={'group'}>
                      <ProjectSelect domain={currentDomain} />
                    </Form.Item>
                    <Divider />
                  </>
                )
              );
            }}
          </Form.Item>
        </Suspense>

        <Form.Item label={t('data.Permission')} name={'permission'}>
          <Radio.Group>
            <Radio value={'rw'} data-testid="rw-permission">
              {t('data.ReadWrite')}
            </Radio>
            <Radio value={'ro'} data-testid="ro-permission">
              {t('data.ReadOnly')}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item dependencies={['usage_mode']} noStyle>
          {({ getFieldValue }) => {
            return (
              getFieldValue('usage_mode') === 'model' && (
                <>
                  <Divider />
                  <Form.Item
                    label={t('data.folders.Cloneable')}
                    name={'cloneable'}
                  >
                    <Switch defaultChecked={false} />
                  </Form.Item>
                </>
              )
            );
          }}
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default FolderCreateModal;
