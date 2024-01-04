import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Spin, Tag, theme } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface ValidationStatusTagProps {
  status?: string;
}

const ValidationStatusTag: React.FC<ValidationStatusTagProps> = ({
  status = 'default',
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  return (
    <Suspense fallback={<Spin indicator={<LoadingOutlined spin />} />}>
      <Tag
        color={status}
        icon={
          status === 'processing' ? (
            <LoadingOutlined spin />
          ) : status === 'success' ? (
            <CheckCircleOutlined />
          ) : (
            <CloseCircleOutlined />
          )
        }
      >
        {status === 'processing'
          ? t('modelService.Processing')
          : status === 'success'
          ? t('modelService.Success')
          : t('modelService.Error')}
      </Tag>
    </Suspense>
  );
};

export default ValidationStatusTag;
