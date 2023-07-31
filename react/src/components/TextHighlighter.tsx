import React from "react";

interface TextHighlighterProps {
  children: string;
  keyword: string;
  style?: React.CSSProperties;
}

const TextHighlighter: React.FC<TextHighlighterProps> = ({
  children,
  keyword,
  style,
}) => {
  const keyIndex = children.toLowerCase().indexOf(keyword?.toLowerCase());
  return (
    <span>
      {children.substring(0, keyIndex)}
      <b style={{ backgroundColor: "orange", color: "black", ...style }}>
        {children.substring(keyIndex, keyIndex + keyword.length)}
      </b>
      {children.substring(keyIndex + keyword.length)}
    </span>
  );
};

export default TextHighlighter;
