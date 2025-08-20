import BAIModal from '../BAIModal';
import TerminalGuideCarousel from './TerminalGuideCarousel';
import { Checkbox, ModalProps } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

interface WebTerminalGuideModalProps extends ModalProps {
  open: boolean;
  onRequestClose: () => void;
}

const WebTerminalGuideModal: React.FC<WebTerminalGuideModalProps> = ({
  open,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const [showGuide, setShowGuide] = useBAISettingUserState('terminal_guide');
  useEffect(() => {
    if (showGuide === null) {
      setShowGuide(true);
    }
  }, [showGuide, setShowGuide]);

  return (
    <BAIModal
      title={t('webTerminalUsageGuide.CopyGuide')}
      width={700}
      open={open}
      onCancel={onRequestClose}
      footer={null}
      destroyOnClose
      {...modalProps}
    >
      <TerminalGuideCarousel />
      <Checkbox
        checked={!showGuide}
        onChange={(e) => setShowGuide(!e.target.checked)}
      >
        {t('dialog.hide.DoNotShowThisAgain')}
      </Checkbox>
    </BAIModal>
  );
};

export default WebTerminalGuideModal;
