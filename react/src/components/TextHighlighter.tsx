import { theme } from 'antd';
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

  if (keyword === undefined) {
    return <span>{children}</span>;
  } else {
    const keyIndex = children.toLowerCase().indexOf(keyword?.toLowerCase());
    const { token } = theme.useToken() || '#F1A239';
    return keyIndex >= 0 ? (
      <span>
        {children.substring(0, keyIndex)}
        <span style={{ backgroundColor: token.colorWarningHover, ...style }}>
          {children.substring(keyIndex, keyIndex + keyword.length)}
        </span>
        {children.substring(keyIndex + keyword.length)}
      </span>
    ) : (
      <span>{children}</span>
    );
  }
};

export default TextHighlighter;
