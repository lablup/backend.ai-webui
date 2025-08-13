import { TerminateSessionModalFragment$key } from '../../__generated__/TerminateSessionModalFragment.graphql';
import BAIModal from '../BAIModal';
import TerminalGuideCarousel from './TerminalGuideCarousel';
import { Checkbox } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WebTerminalGuideModalProps {
  sessionFrgmt?: TerminateSessionModalFragment$key;
  open: boolean;
  onClose: () => void;
  onOpenTerminal?: (sessionUuid: string) => void;
  lang?: string;
}

const WebTerminalGuideModal: React.FC<WebTerminalGuideModalProps> = ({
  // sessionFrgmts,
  open,
  onClose,
  lang = 'en',
}) => {
  const { t } = useTranslation();
  const [hideGuide, setHideGuide] = useState(false);
  const handleCancel = () => {
    if (hideGuide) {
      localStorage.setItem('backendaiwebui.terminalguide', 'false');
    }
    onClose();
  };

  // const docLang = ['en', 'ko', 'ja'].includes(lang) ? lang : 'en'; // accessible doc lang changed.

  return (
    <BAIModal
      centered
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={650}
      title={t('webTerminalUsageGuide.CopyGuide')}
      destroyOnClose
    >
      <TerminalGuideCarousel />
      <Checkbox
        checked={hideGuide}
        onChange={(e) => setHideGuide(e.target.checked)}
      >
        {t('dialog.hide.DoNotShowThisAgain')}
      </Checkbox>
    </BAIModal>
  );
};

export default WebTerminalGuideModal;
