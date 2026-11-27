/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../../app-shim';
import { type ActAsTarget, openActAsTab } from '../../../helper/actAs';
import { Button } from '@lablup/ui-common/Button';
import { HStack } from '@lablup/ui-common/Stack';
import {
  BAICheckboxInput,
  BAIModal,
  type BAIModalProps,
  BAIText,
} from 'backend.ai-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ActAsConfirmModalProps extends Omit<
  BAIModalProps,
  | 'title'
  | 'footer'
  | 'children'
  | 'onOk'
  | 'onCancel'
  | 'isOpen'
  | 'onOpenChange'
> {
  target: Omit<ActAsTarget, 'debug'> | null;
  onRequestClose: () => void;
}

const ActAsConfirmModal: React.FC<ActAsConfirmModalProps> = ({
  target,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [debug, setDebug] = useState(false);
  // Keeps the name on screen during the exit transition; a reopen within it
  // keeps the modal mounted, so a new target also resets the Debug mode choice.
  const [shownTarget, setShownTarget] = useState(target);
  if (target && target !== shownTarget) {
    setShownTarget(target);
    setDebug(false);
  }

  const openTab = () => {
    if (!target) return;
    // The flag rides on the tab's hand-off only, so the user's own settings stay untouched.
    if (!openActAsTab({ ...target, debug })) {
      message.error(t('actAs.FailedToOpen'));
    }
    onRequestClose();
  };

  return (
    <BAIModal
      {...modalProps}
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
      title={t('actAs.ConfirmTitle', {
        name: shownTarget?.name || shownTarget?.email,
      })}
      footer={
        <HStack justify="between" align="center" gap={2}>
          <BAICheckboxInput value={debug} onChange={setDebug}>
            {t('actAs.DebugMode')}
          </BAICheckboxInput>
          <HStack justify="end" gap={2}>
            <Button
              variant="secondary"
              label={t('button.Cancel')}
              onClick={onRequestClose}
            />
            <Button
              variant="primary"
              label={t('actAs.OpenInNewTab')}
              onClick={openTab}
            />
          </HStack>
        </HStack>
      }
    >
      <BAIText>
        {t('actAs.ConfirmDescription', { email: shownTarget?.email })}
      </BAIText>
    </BAIModal>
  );
};

export default ActAsConfirmModal;
