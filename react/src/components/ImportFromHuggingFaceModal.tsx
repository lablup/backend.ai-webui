/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImportFromHuggingFaceModalQuery } from '../__generated__/ImportFromHuggingFaceModalQuery.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useSuspenseTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useProjectPath } from '../hooks/useRouteScope';
import { AstryxFormTextInput } from './astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAICard,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIText,
  useErrorMessageResolver,
  useToggle,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  CloudUpload,
  Filter,
  Rocket,
  CheckIcon,
  CircleCheckBig,
  CircleX,
} from 'lucide-react';
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
  const { token } = useTheme();
  const { t } = useTranslation();
  return (
    <BAICard
      size="small"
      title={
        <BAIFlex direction="row" gap="xs">
          <Filter size="1em" />
          README.md
        </BAIFlex>
      }
      styles={{
        body: {
          padding: token('--spacing-6'),
          overflow: 'auto',
          height: 200,
        },
      }}
    >
      {/* antd `Empty image={PRESENTED_IMAGE_SIMPLE}` → `EmptyState`
          (MAPPING §4). The simple placeholder illustration has no Astryx
          counterpart and is dropped; `title` is required, so the previously
          image-only state gains the wording it always implied. */}
      <EmptyState title={t('autoScalingRule.NoDataAvailable')} isCompact />
    </BAICard>
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
  const { token } = useTheme();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance<Service>>(null);
  const currentProject = useCurrentProjectValue();
  if (!currentProject.id) {
    throw new Error('Project ID is required for ImportFromHuggingFaceModal');
  }
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
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
            {/* antd `Space.Compact` around an input + button → `InputGroup`
                (MAPPING §4). `onChange` now receives the value, not the event.
                PILOT-DECISION: antd's `onPressEnter` shortcut is DROPPED — the
                shared `AstryxFormTextInput` adapter exposes no Enter hook, and
                widening it for one call site is out of this batch's scope. The
                explicit "Check" button beside the field is unchanged and is
                still the only required path. */}
            <InputGroup
              label="Hugging Face URL"
              isLabelHidden
              style={{ width: '100%' }}
            >
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
                <AstryxFormTextInput
                  label="Hugging Face URL"
                  onChange={(value) => {
                    setTypedURL(value);
                  }}
                />
              </Form.Item>
              <Button
                variant={!shouldSkipURLCheck ? 'primary' : 'secondary'}
                isDisabled={shouldSkipURLCheck}
                onClick={() => {
                  handleOnCheck();
                }}
                isLoading={isPendingCheck}
                icon={shouldSkipURLCheck ? <CheckIcon size="1em" /> : undefined}
                isIconOnly={shouldSkipURLCheck}
                label={t('data.modelStore.CheckHuggingFaceUrl')}
              />
            </InputGroup>
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
            <AstryxFormTextInput
              label={t('data.modelStore.ModelStoreFolderName')}
            />
          </Form.Item>
          <Form.Item
            label={t('data.modelStore.ServiceName')}
            name="service_name"
          >
            <AstryxFormTextInput label={t('data.modelStore.ServiceName')} />
          </Form.Item>
          {huggingFaceURL && huggingFaceModelInfo.data?.markdown ? (
            <Suspense fallback={<ReadmeFallbackCard />}>
              <BAICard
                size="small"
                title={
                  <BAIFlex direction="row" gap="xs">
                    <Filter size="1em" />
                    README.md
                  </BAIFlex>
                }
                styles={{
                  body: {
                    padding: token('--spacing-6'),
                    overflow: 'auto',
                    height: 200,
                  },
                }}
              >
                <Markdown>{huggingFaceModelInfo.data?.markdown}</Markdown>
              </BAICard>
            </Suspense>
          ) : (
            <ReadmeFallbackCard />
          )}
          <BAIFlex
            gap={'xs'}
            style={{
              marginTop: token('--spacing-6'),
              marginBottom: token('--spacing-6'),
            }}
          >
            {/* antd `Switch checked` → Astryx `Switch value` (MAPPING §4);
                `label` is required and the control renders it, so the sibling
                caption becomes the label and is hidden as duplicate text. */}
            <Switch
              value={isImportOnly}
              label={t('data.modelStore.ImportOnly')}
              isLabelHidden
              onChange={() => {
                toggleIsImportOnly();
              }}
            />
            <Text>{t('data.modelStore.ImportOnly')}</Text>
          </BAIFlex>
        </Form>
      </BAIModal>
      {/* antd `Modal` → `BAIModal` (the Dialog-based BUI modal); antd `Result`
          → `EmptyState` (MAPPING §"Also COMPOSITION": `subTitle` →
          `description`, `extra` → `actions`). `status` has no Astryx knob, so
          the success/error signal becomes the chosen icon. */}
      <BAIModal
        open={!_.isEmpty(importResult)}
        onCancel={() => setImportResult(undefined)}
        footer={null}
      >
        <EmptyState
          icon={
            importAndStartService?.isSuccess ? (
              <CircleCheckBig size={48} />
            ) : (
              <CircleX size={48} />
            )
          }
          title={
            importAndStartService?.isSuccess
              ? t('data.modelStore.ImportSucceeded')
              : t('dialog.ErrorOccurred')
          }
          description={
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
          actions={
            importAndStartService?.isSuccess ? (
              <BAIFlex gap={'xs'} justify="center" align="center">
                {importResult?.folder?.id && (
                  // PILOT-DECISION: antd wrapped this (conditionally disabled)
                  // button in a Tooltip. Astryx forbids that — a disabled
                  // trigger swallows the hover the wrapper needs — so the
                  // explanation moves onto the button's own `tooltip`, shown
                  // only while the button is actually disabled.
                  <Button
                    isDisabled={
                      baiClient?.is_admin && group?.type !== 'MODEL_STORE'
                    }
                    tooltip={
                      baiClient?.is_admin && group?.type !== 'MODEL_STORE'
                        ? t(
                            'data.modelStore.ChangeTheCurrentProjectToModelStore',
                          )
                        : undefined
                    }
                    label={t('data.modelStore.OpenModelFolder')}
                    onClick={() => {
                      webuiNavigate({
                        pathname: buildProjectPath('data'),
                        search: new URLSearchParams({
                          tab: 'model',
                          folder: importResult.folder.id,
                        }).toString(),
                      });
                    }}
                  />
                )}
                {importResult?.service?.endpoint_id && (
                  <Button
                    variant="primary"
                    label={t('data.modelStore.ViewServiceInfo')}
                    onClick={() => {
                      webuiNavigate(
                        `/serving/${importResult.service?.endpoint_id}`,
                      );
                    }}
                  />
                )}
              </BAIFlex>
            ) : undefined
          }
        />
        {/* antd `Result` rendered its `children` under the subtitle; EmptyState
            has no children slot, so the detail block moves below it. */}
        {importAndStartService?.isSuccess && (
          <div className="desc">
            <BAIText strong>{t('data.modelStore.AddedItems')}</BAIText>
            {importResult?.folder?.name && (
              <Text as="p" display="block">
                <CloudUpload
                  style={{ marginRight: token('--spacing-1') }}
                  size="1em"
                />
                {t('data.modelStore.ModelFolderName')}:{' '}
                <BAIText copyable>{importResult?.folder?.name}</BAIText>
              </Text>
            )}
            {importResult?.service?.name && (
              <Text as="p" display="block">
                <Rocket
                  style={{ marginRight: token('--spacing-1') }}
                  size="1em"
                />
                {t('data.modelStore.ServiceName')}:{' '}
                <BAIText copyable>{importResult?.service?.name}</BAIText>
              </Text>
            )}
          </div>
        )}
      </BAIModal>
    </>
  );
};

export default ImportFromHuggingFaceModal;
