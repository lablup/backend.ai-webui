/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Button, type ButtonProps } from '@astryxdesign/core/Button';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { CheckIcon, CopyIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';

// PILOT-DECISION: antd `ButtonProps` -> Astryx `ButtonProps` (MAPPING.md
// §3.3). Two call-site shapes exist: icon-only (Chat message/code-block
// actions, no children) and icon+visible-text (ImportNotebookForm's
// "Copy HTML"/"Copy Markdown" badges). Astryx `Button.isIconOnly` covers
// both from one component instead of splitting into IconButton/Button.
// `copyable`/`text` is a local prop, not an antd `Typography.Text`
// copyable config passthrough.
interface CopyButtonProps extends Omit<
  ButtonProps,
  'icon' | 'label' | 'children' | 'isIconOnly'
> {
  copyable?: { text: string };
  defaultIcon?: React.ReactNode;
  /** Visible button text. Omit for an icon-only button. */
  children?: string;
}
const CopyButton: React.FC<CopyButtonProps> = ({
  copyable,
  defaultIcon,
  children,
  isDisabled,
  variant,
  ...props
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = async () => {
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  const statusLabel = isCopied
    ? t('sourceCodeViewer.Copied')
    : t('sourceCodeViewer.Copy');
  const hasVisibleText = !!children;

  return (
    <Tooltip
      content={isDisabled ? undefined : statusLabel}
      isOpen={isCopied ? true : undefined}
    >
      <CopyToClipboard text={copyable?.text || ''} onCopy={handleCopy}>
        <Button
          label={hasVisibleText ? children : statusLabel}
          isIconOnly={!hasVisibleText}
          isDisabled={isDisabled}
          icon={isCopied ? <CheckIcon /> : (defaultIcon ?? <CopyIcon />)}
          variant={variant ?? (hasVisibleText ? 'secondary' : 'ghost')}
          {...props}
        />
      </CopyToClipboard>
    </Tooltip>
  );
};

export default CopyButton;
