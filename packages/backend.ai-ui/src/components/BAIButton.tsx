import { Button, type ButtonProps } from 'antd';
import React, { useTransition } from 'react';

export interface BAIButtonProps extends ButtonProps {
  action?: () => Promise<void>;
}

const BAIButton: React.FC<BAIButtonProps> = ({ action, ...props }) => {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      {...props}
      loading={isPending || props.loading}
      onClick={async (e) => {
        if (action) {
          startTransition(async () => {
            await action();
          });
        }
        props.onClick?.(e);
      }}
    />
  );
};

export default BAIButton;
