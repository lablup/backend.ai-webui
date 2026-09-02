/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex } from 'backend.ai-ui';
import { ChevronRight } from 'lucide-react';
import React from 'react';

interface SummaryItemProps {
  title: string;
  contents?: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export const SummaryItem: React.FC<SummaryItemProps> = ({
  title,
  contents,
  onClick,
  icon,
}: SummaryItemProps) => {
  const { token } = useTheme();

  return (
    <BAIFlex direction="column" style={{ width: '100%' }}>
      <BAIFlex
        style={{
          width: '100%',
          height: contents ? 'auto' : '100%',
          borderBottom: contents
            ? `1px solid ${token('--color-border-emphasized')}`
            : 'none',
          padding: token('--spacing-5'),
          justifyContent: 'space-between',
          fontWeight: 'bold',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        {contents ? (
          title
        ) : (
          <>
            {icon}
            {title}
            <ChevronRight
              className="drag-cancel-component"
              style={{ cursor: 'pointer' }}
              onClick={onClick}
              size="1em"
            />
          </>
        )}
      </BAIFlex>
      <BAIFlex
        className="drag-cancel-component"
        style={{
          width: '100%',
          padding: token('--spacing-5'),
        }}
      >
        {contents}
      </BAIFlex>
    </BAIFlex>
  );
};
