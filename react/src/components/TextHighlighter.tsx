/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTheme } from '@astryxdesign/core/theme';
import * as _ from 'lodash-es';
import React from 'react';

interface TextHighlighterProps {
  children?: string | null;
  keyword?: string;
  style?: React.CSSProperties;
}

const TextHighlighter: React.FC<TextHighlighterProps> = ({
  children,
  keyword,
  style,
}) => {
  const { token } = useTheme();
  if (!children) return null;

  if (_.isEmpty(keyword)) {
    return <span>{children}</span>;
  } else {
    const parts = children.split(
      new RegExp(`(${_.escapeRegExp(keyword)})`, 'gi'),
    );

    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === keyword?.toLowerCase() ? (
            <span
              key={i}
              style={{
                backgroundColor: token('--color-warning-hover'),
                ...style,
              }}
              className="text-high-lighter"
            >
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </span>
    );
  }
};

export default React.memo(TextHighlighter);
