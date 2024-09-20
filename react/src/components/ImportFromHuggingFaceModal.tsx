import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { useToggle } from 'ahooks';
import {
  App,
  Button,
  Form,
  FormInstance,
  Input,
  Switch,
  theme,
  Typography,
} from 'antd';
import _ from 'lodash';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

type Service = {
  url: string;
  service_name?: string;
  folder_name?: string;
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
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance<Service>>(null);
  const [isImportOnly, { toggle: toggleIsImportOnly }] = useToggle(false);

  const [huggingFaceURL, setHuggingFaceURL] = useState<string | undefined>();
  const [isPendingCheck, startCheckTransition] = useTransition();
  const hugginFaceModelInfo = useSuspenseTanQuery<{
    author?: string;
    model_name?: string;
    markdown?: string;
    isError?: boolean;
    url?: string;
  }>({
    queryKey: ['huggingFaceValidation', huggingFaceURL],
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

  // validate when huggingFaceModelInfo is updated
  useEffect(() => {
    if (hugginFaceModelInfo.data.url) {
      formRef.current?.validateFields().catch(() => {});
    }
  }, [hugginFaceModelInfo.data.url]);

  const handleOnClick = () => {
    startCheckTransition(() => {
      setHuggingFaceURL(formRef.current?.getFieldValue('url'));
    });
    formRef.current
      ?.validateFields()
      .then((values) => {
        // TODO: Implement import from Hugging Face
        // onRequestClose();
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
          loading={isPendingCheck}
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
        <Form.Item
          label="Hugging Face URL"
          name="url"
          rules={[
            { required: true },
            {
              pattern: /^https:\/\/huggingface.co\/.*/,
              message: t('data.modelStore.StartWithHuggingFaceUrl'),
            },
            {
              validator: async (_, value) => {
                if (
                  !isHuggingfaceURLExisted &&
                  hugginFaceModelInfo.data?.isError &&
                  hugginFaceModelInfo.data.url === value
                ) {
                  return Promise.reject(
                    t('data.modelStore.InvalidHuggingFaceUrl'),
                  );
                } else {
                  return Promise.resolve();
                }
              },
            },
          ]}
        >
          <Input />
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
