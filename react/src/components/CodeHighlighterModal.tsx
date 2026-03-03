/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import SourceCodeView from './SourceCodeView';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';

export interface CodeHighlighterModalProps extends BAIModalProps {
  content: string;
  language: string;
}

const CodeHighlighterModal = ({
  content,
  language,
  ...modalProps
}: CodeHighlighterModalProps) => {
  'use memo';
  return (
    <BAIModal {...modalProps}>
      <SourceCodeView language={language}>{content}</SourceCodeView>
    </BAIModal>
  );
};

export default CodeHighlighterModal;
