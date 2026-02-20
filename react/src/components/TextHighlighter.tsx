/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from 'antd';
import _ from 'lodash';
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
  if (!children) return null;

  if (_.isEmpty(keyword)) {
    return <span>{children}</span>;
  } else {
    const { token } = theme.useToken() || '#F1A239';
    const parts = children.split(
      new RegExp(`(${_.escapeRegExp(keyword)})`, 'gi'),
    );

    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === keyword?.toLowerCase() ? (
            <span
              key={i}
              style={{ backgroundColor: token.colorWarningHover, ...style }}
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
