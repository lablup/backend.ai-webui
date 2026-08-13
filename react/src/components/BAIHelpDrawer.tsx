/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { IconButton } from '@astryxdesign/core/IconButton';
import { BAIDrawerAstryx as BAIDrawer } from 'backend.ai-ui';
import { ExternalLink } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// PILOT-DECISION: antd `Drawer` → `BAIDrawerAstryx` (qa2-c), which wraps lab
// `Drawer` and restores antd's header arrangement. `open` stays `open`,
// `onClose` stays, `size="large"` (antd 736px) → `size={736}`, and the antd
// `styles.body.padding: 0` override becomes `hasBodyPadding={false}` — the
// body here is a full-bleed iframe.
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
    <BAIDrawer
      open={open}
      onClose={onClose}
      side="end"
      size={736}
      title={t('webui.menu.Help')}
      // The body is a full-bleed iframe — antd's call site zeroed
      // `styles.body.padding` for exactly this reason.
      hasBodyPadding={false}
      bodyClassName="bai-help-drawer-body"
      extra={
        // antd `Button type="link" href` → `IconButton` + `window.open`:
        // IconButton renders a <button>, so the anchor affordances are lost
        // while the new-tab behaviour is preserved (same decision as
        // WEBUIHelpButton).
        <IconButton
          variant="ghost"
          label={t('webui.menu.Help')}
          icon={<ExternalLink size="1em" />}
          onClick={() => {
            window.open(URL, '_blank', 'noopener noreferrer');
          }}
        />
      }
    >
      <ExternalContentDisplay url={URL} />
    </BAIDrawer>
  );
};

export default BAIHelpDrawer;
