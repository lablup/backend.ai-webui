/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Drawer } from '@astryxdesign/lab';
import { ExternalLink } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// PILOT-DECISION: antd `Drawer` → lab `Drawer` (MAPPING §2 LAB), the same
// recipe as ticket 18/20's drawer conversions: `open`→`isOpen`,
// `onClose` kept, `size="large"` (antd 736px) → `size={736}`, and the title
// bar (which lab `Drawer` does not have) is rendered as the first content
// row. The `styles.body`/`styles.header` padding overrides go away with it —
// lab `Drawer` renders flush and the body here is a full-bleed iframe, which
// is exactly what `padding: 0` was asking for.
//
// P1 grep: this component currently has NO consumers in `react/src`
// (WEBUIHelpButton opens the hosted manual in a new tab instead), so the
// props interface no longer `extends DrawerProps` — it declares the surface
// its own render needs.
interface BAIHelpDrawerProps {
  open?: boolean;
  onClose?: () => void;
  // Base URL of the manual
  manualURL: string;
  // URL matching table. Key is the URL of the page, value is the URL of the manual page.
  URLMatchingTable?: { [key: string]: string };
  // Key of the URL matching table. If not specified, the manualURL is used.
  matchingKey?: string;
}

const ExternalContentDisplay = ({ url }: { url: string }) => {
  return (
    <iframe
      src={url}
      title="External content"
      style={{
        width: '100%',
        height: '100%',
        border: '0px',
      }}
      allow="fullscreen"
    />
  );
};

const BAIHelpDrawer: React.FC<BAIHelpDrawerProps> = ({
  open = false,
  onClose,
  manualURL,
  URLMatchingTable = {},
  matchingKey = '',
}) => {
  'use memo';
  const { t } = useTranslation();

  const URL =
    manualURL + (matchingKey ? URLMatchingTable[matchingKey] || '' : '');

  return (
    <Drawer
      isOpen={open}
      onClose={() => onClose?.()}
      side="end"
      size={736}
      label={t('webui.menu.Help')}
    >
      <VStack gap={0} align="stretch" style={{ height: '100%' }}>
        <HStack
          gap={2}
          align="center"
          justify="between"
          style={{ padding: 'var(--spacing-4)' }}
        >
          <Heading level={5}>{t('webui.menu.Help')}</Heading>
          {/* antd `Button type="link" href` → `IconButton` + `window.open`:
              IconButton renders a <button>, so the anchor affordances are
              lost while the new-tab behaviour is preserved (same decision as
              WEBUIHelpButton). */}
          <IconButton
            variant="ghost"
            label={t('webui.menu.Help')}
            icon={<ExternalLink size="1em" />}
            onClick={() => {
              window.open(URL, '_blank', 'noopener noreferrer');
            }}
          />
        </HStack>
        <ExternalContentDisplay url={URL} />
      </VStack>
    </Drawer>
  );
};

export default BAIHelpDrawer;
