import { Button, ButtonProps, Tooltip } from 'antd';
import { CopyConfig } from 'antd/es/typography/Base';
import { CheckIcon, CopyIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface CopyButtonProps extends ButtonProps {
  copyable?: Omit<CopyConfig, 'text'> & { text: string };
  defaultIcon?: React.ReactNode;
}
const CopyButton: React.FC<CopyButtonProps> = ({
  copyable,
  defaultIcon,
  ...props
}) => {
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
            isCopied ? <CheckIcon /> : defaultIcon ? defaultIcon : <CopyIcon />
          }
          {...props}
        />
      </CopyToClipboard>
    </Tooltip>
  );
};

export default CopyButton;
