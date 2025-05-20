import { useHighlight } from '../../hooks/useHighlight';
import { HTMLAttributes, memo } from 'react';

export interface SyntaxHighlighterProps extends HTMLAttributes<HTMLDivElement> {
  children: string;
  language: string;
}

export const SyntaxHighlighter = memo<SyntaxHighlighterProps>(
  ({ children, language }) => {
    const { data, isLoading } = useHighlight(children, language);

    return (
      <>
        {isLoading || !data ? (
          <pre>
            <code style={{ whiteSpace: 'pre-wrap' }}>{children}</code>
          </pre>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: data as string }} dir="ltr" />
        )}
      </>
    );
  },
);

SyntaxHighlighter.displayName = 'SyntaxHighlighter';
