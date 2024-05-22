import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import FlexActivityIndicator from './FlexActivityIndicator';
import ValidationStatusTag from './ValidationStatusTag';
import { Button, Tag, theme } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface ServiceValidationModalProps
  extends Omit<BAIModalProps, 'onOK' | 'onCancel'> {
  extraP?: boolean;
  validationStatus?: string;
  validationTime?: string;
  containerLogSummary: string | TrustedHTML;
  onRequestClose: () => void;
}

const ServiceValidationModal: React.FC<ServiceValidationModalProps> = ({
  extraP,
  validationStatus,
  validationTime,
  containerLogSummary,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  // Apply any operation after clicking OK button
  const handleOk = () => {
    onRequestClose();
  };

  return (
    <BAIModal
      width={1000}
      title={t('modelService.ValidationInfo')}
      onCancel={onRequestClose}
      footer={() => (
        <Flex direction="row" justify="end" align="end">
          <Button type="default" onClick={handleOk}>
            {t('button.Close')}
          </Button>
        </Flex>
      )}
      maskClosable={false}
      {...modalProps}
    >
      <Suspense fallback={<FlexActivityIndicator />}>
        <Flex direction="row" justify="between" align="center">
          <h3>{t('modelService.Result')}</h3>
          <ValidationStatusTag status={validationStatus}></ValidationStatusTag>
        </Flex>
        <Flex direction="row" justify="between" align="center">
          <h3>{t('modelService.TimeStamp')}</h3>
          <Tag>{validationTime}</Tag>
        </Flex>
        <h3>{t('modelService.SeeContainerLogs')}</h3>
        <Flex
          direction="column"
          justify="start"
          align="start"
          style={{
            overflowX: 'scroll',
            color: 'white',
            backgroundColor: 'black',
            padding: token.paddingSM,
            borderRadius: token.borderRadius,
          }}
        >
          <pre dangerouslySetInnerHTML={{ __html: containerLogSummary }} />
        </Flex>
      </Suspense>
    </BAIModal>
  );
};

export default ServiceValidationModal;
