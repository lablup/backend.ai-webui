/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentLanguage } from './DefaultProviders';
import HelpDocumentModal from './HelpDocumentModal';
import ReverseThemeProvider from './ReverseThemeProvider';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Maps the first segment of the current route to the corresponding
 * markdown doc path (relative to packages/backend.ai-webui-docs/src/{lang}/).
 */
const docPathMatchingTable: Record<string, string> = {
  '': 'summary/summary.md',
  summary: 'summary/summary.md',
  job: 'sessions_all/sessions_all.md',
  session: 'sessions_all/sessions_all.md',
  chat: 'chat/chat.md',
  serving: 'model_serving/model_serving.md',
  import: 'import_run/import_run.md',
  data: 'vfolder/vfolder.md',
  'agent-summary': 'agent_summary/agent_summary.md',
  statistics: 'statistics/statistics.md',
  credential: 'admin_menu/admin_menu.md',
  environment: 'admin_menu/admin_menu.md',
  'resource-policy': 'admin_menu/admin_menu.md',
  agent: 'admin_menu/admin_menu.md',
  settings: 'admin_menu/admin_menu.md',
  maintenance: 'admin_menu/admin_menu.md',
  information: 'admin_menu/admin_menu.md',
  usersettings: 'user_settings/user_settings.md',
  'my-environment': 'my_environments/my_environments.md',
};

/**
 * Maps the first segment of the current route to the corresponding
 * external docs URL path (for "open in new tab" fallback).
 */
const externalDocMatchingTable: Record<string, string> = {
  '': 'summary/summary.html',
  summary: 'summary/summary.html',
  job: 'sessions_all/sessions_all.html',
  session: 'sessions_all/sessions_all.html',
  chat: 'chat/chat.html',
  serving: 'model_serving/model_serving.html',
  import: 'import_run/import_run.html',
  data: 'vfolder/vfolder.html',
  'agent-summary': 'agent_summary/agent_summary.html',
  statistics: 'statistics/statistics.html',
  credential: 'admin_menu/admin_menu.html',
  environment: 'admin_menu/admin_menu.html#manage-images',
  'resource-policy': 'admin_menu/admin_menu.html#manage-resource-policy',
  agent: 'admin_menu/admin_menu.html#query-agent-nodes',
  settings: 'admin_menu/admin_menu.html#system-settings',
  maintenance: 'admin_menu/admin_menu.html#server-management',
  information: 'admin_menu/admin_menu.html#detailed-information',
  usersettings: 'user_settings/user_settings.html',
  'my-environment': 'my_environments/my_environments.html',
};

interface WEBUIHelpButtonProps extends ButtonProps {}
const WEBUIHelpButton: React.FC<WEBUIHelpButtonProps> = ({ ...props }) => {
  'use memo';
  const [lang] = useCurrentLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const supportedLang = ['en', 'ko', 'ja', 'th'].includes(lang) ? lang : 'en';
  const matchingKey = location.pathname.split('/')[1] || '';

  const docPath = docPathMatchingTable[matchingKey] || 'summary/summary.md';

  const externalDocURL =
    `https://webui.docs.backend.ai/${['en', 'ko'].includes(lang) ? lang : 'en'}/latest/` +
    (externalDocMatchingTable[matchingKey] || '');

  return (
    <>
      <Button
        icon={<QuestionCircleOutlined />}
        type="text"
        onClick={() => setOpen(true)}
        {...props}
      />
      {/* ReverseThemeProvider restores the original app theme since this
          button is rendered inside a ReverseThemeProvider in WebUIHeader. */}
      <ReverseThemeProvider>
        <HelpDocumentModal
          open={open}
          onCancel={() => setOpen(false)}
          docPath={docPath}
          docLang={supportedLang}
          externalDocURL={externalDocURL}
        />
      </ReverseThemeProvider>
    </>
  );
};

export default WEBUIHelpButton;
