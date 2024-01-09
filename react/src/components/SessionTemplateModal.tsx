import BAIModal, { BAIModalProps } from './BAIModal';
import React from 'react';

interface SessionTemplateModalProps extends BAIModalProps {}
const SessionTemplateModal: React.FC<SessionTemplateModalProps> = ({
  ...modalProps
}) => {
  return <BAIModal {...modalProps}></BAIModal>;
};

export default SessionTemplateModal;
