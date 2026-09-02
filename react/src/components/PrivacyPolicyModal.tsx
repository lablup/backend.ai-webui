/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import './documentProse.css';
import { BAISkeleton, BAIModal, BAIModalProps } from 'backend.ai-ui';
import DOMPurify from 'dompurify';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface PrivacyPolicyModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const RenderPrivacyPolicyHtml = () => {
  const [selectedLanguage] = useBAISettingUserState('selected_language');
  const defaultLanguage =
    globalThis.navigator.language &&
    globalThis.navigator.language.split('-')[0] === 'ko'
      ? 'ko'
      : 'en';
  const language = useMemo(() => {
    if (!selectedLanguage) {
      return defaultLanguage;
    }
    return selectedLanguage === 'ko' ? 'ko' : 'en';
  }, [selectedLanguage, defaultLanguage]);

  const { data } = useSuspenseTanQuery({
    queryKey: ['privacyPolicy', language],
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    queryFn: () =>
      fetch(`/resources/documents/privacy-policy.${language}.html`).then(
        (response) => response.text(),
      ),
  });
  // `bai-document-prose` restores block rhythm and list semantics for this
  // un-classed fetched document. Astryx's `reset.css` zeroes heading and
  // paragraph margins and strips list markers and padding — correct for a
  // component library, and nothing legacy did, since `origin/main` imported no
  // reset and antd's base rules were scoped to `[class^="ant-"]`. Without it a
  // 200-item numbered legal document renders unnumbered, unindented and
  // unspaced, with invisible links. QA-FINDINGS Q-22; derivation in the CSS.
  return (
    <div
      className="bai-document-prose"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data) }}
    />
  );
};

const PrivacyPolicyModal = ({
  onRequestClose,
  ...props
}: PrivacyPolicyModalProps) => {
  const { t } = useTranslation();
  return (
    <BAIModal
      title={t('webui.menu.PrivacyPolicy')}
      onCancel={onRequestClose}
      destroyOnHidden
      footer={null}
      width={'80%'}
      {...props}
    >
      <Suspense fallback={<BAISkeleton rows={4} />}>
        <RenderPrivacyPolicyHtml />
      </Suspense>
    </BAIModal>
  );
};

export default PrivacyPolicyModal;
