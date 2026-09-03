import { useTheme } from '@astryxdesign/core/theme';
import * as _ from 'lodash-es';
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
