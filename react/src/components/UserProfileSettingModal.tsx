/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The account dialog's frame. The form is a lazy chunk
 (`UserProfileSettingModalBody`, which also pulls in the Relay mutation), so
 the dialog and its footer paint on click and the body fills in (#11144).
 */
import type { UserProfileSettingModalBodyFragment$key } from '../__generated__/UserProfileSettingModalBodyFragment.graphql';
import { BAIModal, BAISkeleton, type BAIModalProps } from 'backend.ai-ui';
import React, { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const UserProfileSettingModalBody = React.lazy(
  () => import('./UserProfileSettingModalBody'),
);

interface Props extends BAIModalProps {
  userFrgmt: UserProfileSettingModalBodyFragment$key | null | undefined;
  currentClientIp?: string;
  onRequestClose: (success?: boolean) => void;
  onRequestRefresh: () => void;
  totpSupported?: boolean;
}

const UserProfileSettingModal: React.FC<Props> = ({
  onRequestClose,
  onRequestRefresh,
  totpSupported,
  userFrgmt,
  currentClientIp,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  // The body owns the form, so it hands its submit and its in-flight state
  // back here.
  const submitRef = useRef<(() => void) | null>(null);
  const [isBodyReady, setIsBodyReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <BAIModal
      {...baiModalProps}
      okText={t('webui.menu.Update')}
      cancelText={t('webui.menu.Cancel')}
      onCancel={() => {
        onRequestClose();
      }}
      confirmLoading={isSubmitting}
      okButtonProps={{ disabled: !isBodyReady }}
      onOk={() => submitRef.current?.()}
      centered
      title={t('webui.menu.MyAccountInformation')}
    >
      <Suspense fallback={<BAISkeleton rows={6} />}>
        <UserProfileSettingModalBody
          userFrgmt={userFrgmt}
          currentClientIp={currentClientIp}
          totpSupported={totpSupported}
          onRequestClose={onRequestClose}
          onRequestRefresh={onRequestRefresh}
          submitRef={submitRef}
          onReadyChange={setIsBodyReady}
          onSubmittingChange={setIsSubmitting}
        />
      </Suspense>
    </BAIModal>
  );
};

export default UserProfileSettingModal;
