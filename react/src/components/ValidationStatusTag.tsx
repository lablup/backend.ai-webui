/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Spin, Tag } from 'antd';
import { CircleCheck, Clock, CircleX, LoaderCircle } from 'lucide-react';
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
    <Suspense
      fallback={
        <Spin
          indicator={<LoaderCircle className="anticon-spin" size="1em" />}
        />
      }
    >
      <Tag
        color={getStatusColor(status)}
        icon={
          status === 'processing' ? (
            <LoaderCircle className="anticon-spin" size="1em" />
          ) : status === 'finished' ? (
            <CircleCheck size="1em" />
          ) : status === 'error' ? (
            <CircleX size="1em" />
          ) : (
            <Clock size="1em" />
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
