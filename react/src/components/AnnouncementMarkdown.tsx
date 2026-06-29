/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { createStyles } from 'antd-style';
import Markdown from 'markdown-to-jsx';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  // Collapse the leading/trailing block margins so the rendered announcement
  // sits flush with whatever container it is placed in (alert body, preview
  // box, etc.), keeping spacing consistent across call sites.
  content: css`
    & > *:first-child {
      margin-top: 0;
    }
    & > *:last-child {
      margin-bottom: 0;
    }
  `,
}));

interface AnnouncementMarkdownProps {
  children: string;
}

/**
 * Renders an announcement message as markdown with collapsed outer margins.
 * Shared by the announcement alert and the announcement edit modal preview so
 * both render identically.
 */
const AnnouncementMarkdown: React.FC<AnnouncementMarkdownProps> = ({
  children,
}) => {
  'use memo';
  const { styles } = useStyles();
  return (
    <div className={styles.content}>
      <Markdown>{children}</Markdown>
    </div>
  );
};

export default AnnouncementMarkdown;
