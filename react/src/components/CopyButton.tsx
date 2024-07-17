'use client';

import { Button, ButtonProps, Tooltip } from 'antd';
import { CopyConfig } from 'antd/es/typography/Base';
import { TextProps } from 'antd/es/typography/Text';
import { CheckIcon, CopyIcon } from 'lucide-react';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

interface CopyButtonProps extends ButtonProps {
  copyable?: CopyConfig;
}
const CopyButton: React.FC<CopyButtonProps> = ({ copyable, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (copyable?.text) {
      // @ts-ignore
      await navigator.clipboard.writeText(copyable.text);
      setIsCopied(true);
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  return (
    <Tooltip
      title={isCopied ? 'Copied!' : 'Copy'}
      open={isCopied ? true : undefined}
    >
      <Button
        icon={isCopied ? <CheckIcon /> : <CopyIcon />}
        {...props}
        onClick={handleCopy}
      />
    </Tooltip>
  );
};

export default CopyButton;
