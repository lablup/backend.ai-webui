import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { useToggle } from 'ahooks';
import {
  Button,
  Descriptions,
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
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

type Service = {
  url: string;
  inference_engine_version?: string;
  replica_number?: number;
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
  const hugginFaceModelInfo = useSuspenseTanQuery<{
    author?: string;
    model_name?: string;
    markdown?: string;
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
    hugginFaceModelInfo.data.model_name,
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
    if (hugginFaceModelInfo.data.url) {
      formRef.current?.validateFields().catch(() => {});
    }
  }, [hugginFaceModelInfo.data.url]);

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
          disabled={!shouldSkipURLCheck}
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
        <Form.Item>
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
                placeholder={t('data.modelStore.huggingFaceUrlPlaceholder')}
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
                validator: async (_, value) => {
                  if (
                    !isHuggingfaceURLExisted &&
                    hugginFaceModelInfo.data?.isError &&
                    hugginFaceModelInfo.data.url === typedURL
                  ) {
                    return Promise.reject(
                      t('data.modelStore.InvalidHuggingFaceUrl'),
                    );
                  } else {
                    if (shouldSkipURLCheck) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject(
                        t('data.modelStore.InvalidHuggingFaceUrl'),
                      );
                    }
                  }
                },
              },
            ]}
          ></Form.Item>
        </Form.Item>
        <Descriptions
          bordered
          style={{
            opacity: shouldSkipURLCheck ? 1 : 0.7,
          }}
          column={1}
        >
          <Descriptions.Item label={t('data.modelStore.ModelName')}>
            {shouldSkipURLCheck && hugginFaceModelInfo.data?.model_name}
          </Descriptions.Item>
          <Descriptions.Item label={t('data.modelStore.Author')}>
            {shouldSkipURLCheck && hugginFaceModelInfo.data?.author}
          </Descriptions.Item>
        </Descriptions>
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
