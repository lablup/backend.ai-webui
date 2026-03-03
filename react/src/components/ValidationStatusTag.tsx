/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Spin, Tag } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface ValidationStatusTagProps {
  status?: string;
}

const ValidationStatusTag: React.FC<ValidationStatusTagProps> = ({
  status = 'default',
}) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'default':
      case 'finished':
      default:
        return 'default';
      case 'processing':
        return 'processing';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
    }
  };

  return (
    <Suspense fallback={<Spin indicator={<LoadingOutlined spin />} />}>
      <Tag
        color={getStatusColor(status)}
        icon={
          status === 'processing' ? (
            <LoadingOutlined spin />
          ) : status === 'finished' ? (
            <CheckCircleOutlined />
          ) : status === 'error' ? (
            <CloseCircleOutlined />
          ) : (
            <ClockCircleOutlined />
          )
        }
      >
        {status === 'processing'
          ? t('modelService.Processing')
          : status === 'finished'
            ? t('modelService.Finished')
            : status === 'error'
              ? t('modelService.Error')
              : t('modelService.Ready')}
      </Tag>
    </Suspense>
  );
};

export default ValidationStatusTag;
