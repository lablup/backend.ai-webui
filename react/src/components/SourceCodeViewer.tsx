import { useThemeMode } from '../hooks/useThemeMode';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { Button, Tooltip, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { Highlight, themes } from 'prism-react-renderer';
import { useRef, useState } from 'react';
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
  const timerRef = useRef<number>(null);
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
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          style={{
            margin: 0,
            padding: token.padding,
            borderRadius: token.borderRadius,
            overflow: wordWrap ? undefined : 'overlay',
            ...style,
          }}
        >
          <code
            style={{
              display: 'block',
              whiteSpace: wordWrap ? 'pre-wrap' : 'scroll',
              overflowWrap: wordWrap ? 'anywhere' : undefined,
            }}
          >
            {_.map(tokens, (line, i) => {
              return (
                <div key={i} {...getLineProps({ line })}>
                  {_.map(line, (token, key) => {
                    return (
                      <span key={key} {...getTokenProps({ token })}>
                        {token.content}
                      </span>
                    );
                  })}
                  {'\n'}
                </div>
              );
            })}
          </code>
        </pre>
      )}
    </Highlight>
  );

  return (
    <BAIFlex
      onMouseEnter={() => setIsMouseEntered(true)}
      onMouseLeave={() => setIsMouseEntered(false)}
      style={{ width: '100%' }}
    >
      <CopyToClipboard
        text={children}
        onCopy={() => {
          setIsCopied(true);
          timerRef.current && clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        }}
      >
        <BAIFlex style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <Tooltip
            title={
              isCopied
                ? t('sourceCodeViewer.Copied')
                : t('sourceCodeViewer.Copy')
            }
          >
            <Button
              size="small"
              icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
              style={{
                opacity: isMouseEntered ? 1 : 0,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease-in-out',
                position: 'sticky',
              }}
            />
          </Tooltip>
        </BAIFlex>
      </CopyToClipboard>
      {HighLightedCode}
    </BAIFlex>
  );
};

export default SourceCodeViewer;
