import { useHighlight } from '../../hooks/useHighlight';
import DOMPurify from 'dompurify';
import { HTMLAttributes, memo } from 'react';

export interface SyntaxHighlighterProps extends HTMLAttributes<HTMLDivElement> {
  children: string;
  language: string;
}

export const SyntaxHighlighter = memo<SyntaxHighlighterProps>(
  ({ children, language, ...props }) => {
    const { data, isLoading } = useHighlight(children, language);

    return (
      <>
        {isLoading || !data ? (
          <pre>
            <code style={{ whiteSpace: 'pre-wrap' }}>{children}</code>
          </pre>
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data) }}
            dir="ltr"
            {...props}
          />
        )}
      </>
    );
  },
);

SyntaxHighlighter.displayName = 'SyntaxHighlighter';
