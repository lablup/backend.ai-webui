/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImportFromHuggingFaceModalQuery } from '../__generated__/ImportFromHuggingFaceModalQuery.graphql';
import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useSuspenseTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  CloudUploadOutlined,
  FilterOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  App,
  Button,
  Card,
  Empty,
  Form,
  FormInstance,
  Input,
  Modal,
  Result,
  Space,
  Switch,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import _ from 'lodash';
import { CheckIcon } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import React, {
  Suspense,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type Service = {
  url: string;
  service_name?: string;
  folder_name?: string;
};

type ImportFromHuggingFaceResult = {
  folder: {
    id: string;
    name: string;
  };
  service?: {
    endpoint_id: string;
    name: string;
  };
};

const ReadmeFallbackCard = () => {
  const { token } = theme.useToken();
  return (
    <Card
      size="small"
      title={
        <BAIFlex direction="row" gap="xs">
          <FilterOutlined />
          README.md
        </BAIFlex>
      }
      styles={{
        body: {
          padding: token.paddingLG,
          overflow: 'auto',
          height: 200,
        },
      }}
    >
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </Card>
  );
};

interface ImportFromHuggingFaceModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const ImportFromHuggingFaceModal: React.FC<ImportFromHuggingFaceModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance<Service>>(null);
  const currentProject = useCurrentProjectValue();
  if (!currentProject.id) {
    throw new Error('Project ID is required for ImportFromHuggingFaceModal');
  }
  const webuiNavigate = useWebUINavigate();
  const [isImportOnly, { toggle: toggleIsImportOnly }] = useToggle(false);
  const [huggingFaceURL, setHuggingFaceURL] = useState<string | undefined>();
  const [typedURL, setTypedURL] = useState<string>('');
  const [isPendingCheck, startCheckTransition] = useTransition();
  const [importResult, setImportResult] = useState<
    ImportFromHuggingFaceResult | undefined
  >();

  const { group } = useLazyLoadQuery<ImportFromHuggingFaceModalQuery>(
    graphql`
      query ImportFromHuggingFaceModalQuery($id: UUID!) {
        group(id: $id) {
          type @since(version: "24.03.0")
        }
      }
    `,
    { id: currentProject.id },
  );

  const huggingFaceModelInfo = useSuspenseTanQuery<{
    author?: string;
    model_name?: string;
    markdown?: string;
    pipeline_tag?: string;
    isError?: boolean;
    url?: string;
  }>({
    queryKey: ['huggingFaceReadme', huggingFaceURL],
    queryFn: () => {
      if (_.isEmpty(huggingFaceURL)) return Promise.resolve({});
      const searchParams = new URLSearchParams({
        huggingface_url: huggingFaceURL ?? '',
      });
      return baiSignedRequestWithPromise({
        method: 'GET',
        url: `/services/_/huggingface/models?${searchParams.toString()}`,
        client: baiClient,
      })
        .then((result: any) => {
          return {
            ...result,
            url: huggingFaceURL,
          };
        })
        .catch(() => {
          // TODO: handle error more gracefully
          return {
            isError: true,
            url: huggingFaceURL,
          };
        });
    },
  });
  const isHuggingfaceURLExisted = !_.isEmpty(
    huggingFaceModelInfo.data.model_name,
  );
  const shouldSkipURLCheck =
    isHuggingfaceURLExisted && huggingFaceURL === typedURL;

  // reset when modal is closed
  useEffect(() => {
    if (!baiModalProps.open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHuggingFaceURL(undefined);

      setTypedURL('');
    }
  }, [baiModalProps.open]);

  const importAndStartService = useTanMutation({
    mutationFn: (values: {
      huggingFaceUrl: string;
      importOnly?: boolean;
      serviceName?: string;
      folderName?: string;
    }) => {
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/services/_/huggingface/models',
        body: {
          huggingface_url: values.huggingFaceUrl,
          import_only: values?.importOnly,
          service_name: values?.serviceName,
          folder_name: values?.folderName,
        },
        client: baiClient,
      });
    },
  });

  // validate when huggingFaceModelInfo is updated
  useEffect(() => {
    if (huggingFaceModelInfo.data.url) {
      formRef.current?.validateFields().catch(() => {});
    }
  }, [huggingFaceModelInfo.data.url]);

  const handleOnClick = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        importAndStartService.mutate(
          {
            huggingFaceUrl: values.url,
            importOnly: isImportOnly,
            serviceName: values.service_name || undefined,
            folderName: values.folder_name || undefined,
          },
          {
            onSuccess(data: any) {
              setImportResult(data);
              onRequestClose();
            },
            onError(e) {
              message.error(getErrorMessage(e));
            },
          },
        );
      })
      .catch(() => {});
  };

  const handleOnCheck = () => {
    formRef.current
      ?.validateFields(['url'])
      .then((v) => {
        startCheckTransition(() => {
          setHuggingFaceURL(v?.url);
        });
      })
      .catch(() => {});
  };

  return (
    <>
      <BAIModal
        title={t('data.modelStore.ImportFromHuggingFace')}
        centered
        confirmLoading={importAndStartService.isPending}
        okText={
          isImportOnly
            ? t('data.modelStore.Import')
            : t('data.modelStore.ImportAndStartService')
        }
        onOk={handleOnClick}
        okButtonProps={{
          disabled:
            !shouldSkipURLCheck ||
            (!_.isEmpty(huggingFaceModelInfo.data?.pipeline_tag) &&
              huggingFaceModelInfo.data?.pipeline_tag !== 'text-generation'),
        }}
        onCancel={onRequestClose}
        destroyOnHidden
        {...baiModalProps}
      >
        <Form ref={formRef} preserve={false} layout="vertical">
          <Form.Item label="Hugging Face URL" required>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                noStyle
                name="url"
                rules={[
                  { required: true },
                  {
                    pattern: /^https:\/\/huggingface.co\/.*/,
                    message: t('data.modelStore.StartWithHuggingFaceUrl'),
                  },
                ]}
              >
                <Input
                  onPressEnter={() => {
                    handleOnCheck();
                  }}
                  onChange={(e) => {
                    setTypedURL(e.target.value);
                  }}
                />
              </Form.Item>
              <Button
                type={!shouldSkipURLCheck ? 'primary' : 'default'}
                disabled={shouldSkipURLCheck}
                onClick={() => {
                  handleOnCheck();
                }}
                loading={isPendingCheck}
              >
                {shouldSkipURLCheck ? (
                  <CheckIcon />
                ) : (
                  t('data.modelStore.CheckHuggingFaceUrl')
                )}
              </Button>
            </Space.Compact>
            <Form.Item
              noStyle
              name=""
              rules={[
                {
                  validator: async () => {
                    if (
                      !isHuggingfaceURLExisted &&
                      huggingFaceModelInfo.data?.isError &&
                      huggingFaceModelInfo.data.url === typedURL
                    ) {
                      return Promise.reject(
                        t('data.modelStore.InvalidHuggingFaceUrl'),
                      );
                    } else {
                      if (!shouldSkipURLCheck) {
                        return Promise.reject(
                          t('data.modelStore.InvalidHuggingFaceUrl'),
                        );
                      } else if (
                        !_.isEmpty(huggingFaceModelInfo.data?.pipeline_tag) &&
                        huggingFaceModelInfo.data?.pipeline_tag !==
                          'text-generation'
                      ) {
                        return Promise.reject(
                          t('data.modelStore.NotSupportedModel'),
                        );
                      } else {
                        return Promise.resolve();
                      }
                    }
                  },
                },
              ]}
            ></Form.Item>
          </Form.Item>
          <Form.Item
            label={t('data.modelStore.ModelStoreFolderName')}
            name="folder_name"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('data.modelStore.ServiceName')}
            name="service_name"
          >
            <Input />
          </Form.Item>
          {huggingFaceURL && huggingFaceModelInfo.data?.markdown ? (
            <Suspense fallback={<ReadmeFallbackCard />}>
              <Card
                size="small"
                title={
                  <BAIFlex direction="row" gap="xs">
                    <FilterOutlined />
                    README.md
                  </BAIFlex>
                }
                styles={{
                  body: {
                    padding: token.paddingLG,
                    overflow: 'auto',
                    height: 200,
                  },
                }}
              >
                <Markdown>{huggingFaceModelInfo.data?.markdown}</Markdown>
              </Card>
            </Suspense>
          ) : (
            <ReadmeFallbackCard />
          )}
          <BAIFlex
            gap={'xs'}
            style={{ marginTop: token.marginLG, marginBottom: token.marginLG }}
          >
            <Switch
              checked={isImportOnly}
              onChange={() => {
                toggleIsImportOnly();
              }}
            />
            <Typography.Text>{t('data.modelStore.ImportOnly')}</Typography.Text>
          </BAIFlex>
        </Form>
      </BAIModal>
      <Modal
        open={!_.isEmpty(importResult)}
        onCancel={() => setImportResult(undefined)}
        footer={null}
      >
        <Result
          status={importAndStartService?.isSuccess ? 'success' : 'error'}
          title={
            importAndStartService?.isSuccess
              ? t('data.modelStore.ImportSucceeded')
              : t('dialog.ErrorOccurred')
          }
          subTitle={
            importAndStartService?.isSuccess
              ? isImportOnly
                ? t('data.modelStore.ImportOnlySuccessDesc', {
                    folderName: importResult?.folder?.name,
                  })
                : t('data.modelStore.ImportAndStartServiceSuccessDesc', {
                    folderName: importResult?.folder?.name,
                    serviceName: importResult?.service?.name,
                  })
              : getErrorMessage(importAndStartService?.error)
          }
          extra={
            importAndStartService?.isSuccess && (
              <BAIFlex gap={'xs'} justify="center" align="center">
                {importResult?.folder?.id && (
                  <Tooltip
                    title={
                      baiClient?.is_admin && group?.type !== 'MODEL_STORE'
                        ? t(
                            'data.modelStore.ChangeTheCurrentProjectToModelStore',
                          )
                        : ''
                    }
                  >
                    <Button
                      disabled={
                        baiClient?.is_admin && group?.type !== 'MODEL_STORE'
                      }
                      onClick={() => {
                        webuiNavigate({
                          pathname: '/data',
                          search: new URLSearchParams({
                            tab: 'model',
                            folder: importResult.folder.id,
                          }).toString(),
                        });
                      }}
                    >
                      {t('data.modelStore.OpenModelFolder')}
                    </Button>
                  </Tooltip>
                )}
                {importResult?.service?.endpoint_id && (
                  <Button
                    type="primary"
                    onClick={() => {
                      webuiNavigate(
                        `/serving/${importResult.service?.endpoint_id}`,
                      );
                    }}
                  >
                    {t('data.modelStore.ViewServiceInfo')}
                  </Button>
                )}
              </BAIFlex>
            )
          }
        >
          {importAndStartService?.isSuccess && (
            <div className="desc">
              <Typography.Paragraph>
                <Typography.Text strong>
                  {t('data.modelStore.AddedItems')}
                </Typography.Text>
              </Typography.Paragraph>
              {importResult?.folder?.name && (
                <Typography.Paragraph>
                  <Typography.Text>
                    <CloudUploadOutlined
                      style={{ marginRight: token.marginXXS }}
                    />
                    {t('data.modelStore.ModelFolderName')}:{' '}
                    <Typography.Text copyable>
                      {importResult?.folder?.name}
                    </Typography.Text>
                  </Typography.Text>
                </Typography.Paragraph>
              )}
              {importResult?.service?.name && (
                <Typography.Paragraph>
                  <Typography.Text>
                    <RocketOutlined style={{ marginRight: token.marginXXS }} />
                    {t('data.modelStore.ServiceName')}:{' '}
                    <Typography.Text copyable>
                      {importResult?.service?.name}
                    </Typography.Text>
                  </Typography.Text>
                </Typography.Paragraph>
              )}
            </div>
          )}
        </Result>
      </Modal>
    </>
  );
};

export default ImportFromHuggingFaceModal;
