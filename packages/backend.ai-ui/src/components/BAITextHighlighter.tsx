import { theme } from 'antd';
import _ from 'lodash';
import React from 'react';

interface BAITextHighlighterProps {
  children?: string | null;
  keyword?: string;
  style?: React.CSSProperties;
}

const BAITextHighlighter: React.FC<BAITextHighlighterProps> = ({
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

export default React.memo(BAITextHighlighter);
