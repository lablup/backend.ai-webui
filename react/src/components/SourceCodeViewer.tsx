import { useThemeMode } from '../hooks/useThemeMode';
import Flex from './Flex';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { Button, Tooltip, theme } from 'antd';
import _ from 'lodash';
import { Highlight, themes } from 'prism-react-renderer';
import { useRef, useState } from 'react';
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';

interface SourceCodeViewerProps {
  children: string;
  language: string;
  wordWrap?: boolean;
}

const SourceCodeViewer: React.FC<SourceCodeViewerProps> = ({
  children,
  language,
  wordWrap,
}) => {
  const timerRef = useRef<number | undefined>(undefined);
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  const [isCopied, setIsCopied] = useState(false);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const HighLightedCode = (
    <Highlight
      theme={isDarkMode ? themes.jettwaveDark : themes.jettwaveLight}
      code={children || ''}
      language={language || ''}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          style={{
            ...style,
            width: '100%',
            margin: 0,
            padding: token.padding,
            borderRadius: token.borderRadius,
            overflow: wordWrap ? undefined : 'overlay',
          }}
        >
          <code
            style={{
              whiteSpace: wordWrap ? 'pre-wrap' : undefined,
              overflowWrap: wordWrap ? 'anywhere' : undefined,
            }}
          >
            {_.map(tokens, (line, i) => {
              return (
                <span key={i} {...getLineProps({ line })}>
                  {_.map(line, (token, key) => {
                    /** The codes below fix some line wrapping errors during the conversion process. **/
                    if (!token.content && key === line.length - 1) {
                      return '\n';
                    }
                    if (line.length === 1 && token.content === ' ') {
                      return '\n';
                    }
                    /** **/
                    return (
                      <span key={key} {...getTokenProps({ token })}>
                        {token.content}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </code>
        </pre>
      )}
    </Highlight>
  );

  return (
    <Flex
      onMouseEnter={() => setIsMouseEntered(true)}
      onMouseLeave={() => setIsMouseEntered(false)}
    >
      <CopyToClipboard
        text={children}
        onCopy={() => {
          setIsCopied(true);
          clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        }}
      >
        <Tooltip
          title={
            isCopied ? t('sourceCodeViewer.Copied') : t('sourceCodeViewer.Copy')
          }
        >
          <Button
            style={{
              top: token.sizeSM,
              right: token.sizeSM,
              zIndex: token.zIndexBase + 1,
              opacity: isMouseEntered ? 1 : 0,
              backgroundColor: token.colorFillSecondary,
              cursor: 'pointer',
              position: 'absolute',
              transition: 'opacity 0.2s ease-in-out',
            }}
            size="small"
            icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
          />
        </Tooltip>
      </CopyToClipboard>
      {HighLightedCode}
    </Flex>
  );
};

export default SourceCodeViewer;
