import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { FilterOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Button,
  Card,
  Empty,
  Form,
  FormInstance,
  Input,
  Space,
  Switch,
  theme,
  Typography,
} from 'antd';
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

type Service = {
  url: string;
  service_name?: string;
  folder_name?: string;
};

const ReadmeFallbackCard = () => {
  const { token } = theme.useToken();
  return (
    <Card
      size="small"
      title={
        <Flex direction="row" gap="xs">
          <FilterOutlined />
          README.md
        </Flex>
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
  const formRef = useRef<FormInstance<Service>>(null);
  const [isImportOnly, { toggle: toggleIsImportOnly }] = useToggle(false);
  const [huggingFaceURL, setHuggingFaceURL] = useState<string | undefined>();
  const [typedURL, setTypedURL] = useState('');
  const baiClient = useSuspendedBackendaiClient();

  const [isPendingCheck, startCheckTransition] = useTransition();
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
      return baiSignedRequestWithPromise({
        method: 'GET',
        url: `/services/_/huggingface/models?huggingface_url=${huggingFaceURL}`,
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
      setHuggingFaceURL(undefined);
      setTypedURL('');
    }
  }, [baiModalProps.open]);

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
        // TODO: Implement import from Hugging Face
        onRequestClose();
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
    <BAIModal
      title={t('data.modelStore.ImportFromHuggingFace')}
      centered
      footer={
        <Button
          type="primary"
          htmlType="submit"
          onClick={handleOnClick}
          disabled={
            !shouldSkipURLCheck ||
            (!_.isEmpty(huggingFaceModelInfo.data?.pipeline_tag) &&
              huggingFaceModelInfo.data?.pipeline_tag !== 'text-generation')
          }
        >
          {isImportOnly
            ? t('data.modelStore.Import')
            : t('data.modelStore.ImportAndStartService')}
        </Button>
      }
      onCancel={onRequestClose}
      destroyOnClose
      {...baiModalProps}
    >
      <Form
        ref={formRef}
        preserve={false}
        layout="vertical"
        requiredMark="optional"
      >
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
        <Form.Item label={t('data.modelStore.ServiceName')} name="service_name">
          <Input />
        </Form.Item>
        {huggingFaceURL && huggingFaceModelInfo.data?.markdown ? (
          <Suspense fallback={<ReadmeFallbackCard />}>
            <Card
              size="small"
              title={
                <Flex direction="row" gap="xs">
                  <FilterOutlined />
                  README.md
                </Flex>
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
        <Flex
          gap={'xs'}
          style={{ marginTop: token.marginLG, marginBottom: token.marginLG }}
        >
          <Switch
            checked={isImportOnly}
            onChange={(e) => {
              toggleIsImportOnly();
            }}
          />
          <Typography.Text>{t('data.modelStore.ImportOnly')}</Typography.Text>
        </Flex>
      </Form>
    </BAIModal>
  );
};

export default ImportFromHuggingFaceModal;
