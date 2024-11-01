import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { Button, ButtonProps, theme, Tooltip } from 'antd';
import { CopyConfig } from 'antd/es/typography/Base';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface CopyButtonProps extends ButtonProps {
  copyable?: Omit<CopyConfig, 'text'> & { text: string };
  defaultIcon?: React.ReactNode;
}
const CopyButton: React.FC<CopyButtonProps> = ({
  copyable,
  defaultIcon,
  ...buttonProps
}) => {
  const { token } = theme.useToken();
  const [isCopied, setIsCopied] = useState(false);

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

  return (
    <Tooltip
      title={isCopied ? 'Copied!' : 'Copy'}
      open={isCopied ? true : undefined}
    >
      <CopyToClipboard text={copyable?.text || ''} onCopy={handleCopy}>
        <Button
          icon={
            isCopied ? (
              <CheckOutlined />
            ) : defaultIcon ? (
              defaultIcon
            ) : (
              <CopyOutlined />
            )
          }
          type="text"
          style={{ color: token.colorPrimary }}
          {...buttonProps}
        />
      </CopyToClipboard>
    </Tooltip>
  );
};

export default CopyButton;
