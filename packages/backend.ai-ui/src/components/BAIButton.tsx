import { Button, type ButtonProps } from 'antd';
import React, { useRef, useTransition } from 'react';

export interface BAIButtonProps extends ButtonProps {
  action?: () => Promise<void>;
}

const BAIButton: React.FC<BAIButtonProps> = ({ action, ...props }) => {
  const [isPending, startTransition] = useTransition();
  const isRunningRef = useRef(false);
  return (
    <Button
      {...props}
      loading={isPending || props.loading}
      onClick={(e) => {
        if (action) {
          if (isRunningRef.current) return;
          isRunningRef.current = true;
          startTransition(async () => {
            try {
              await action();
            } finally {
              isRunningRef.current = false;
            }
          });
        }
        props.onClick?.(e);
      }}
    />
  );
};

export default BAIButton;
