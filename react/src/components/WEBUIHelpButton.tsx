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
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

/**
 * Maps route keys to the corresponding markdown doc path
 * (relative to packages/backend.ai-webui-docs/src/{lang}/).
 *
 * Keys use the format "routeSegment" or "routeSegment:tab" for tab-specific
 * anchors. A "#anchor" suffix scrolls the help modal to that section.
 */
const docPathMatchingTable: Record<string, string> = {
  '': 'summary/summary.md',
  summary: 'summary/summary.md',
  dashboard: 'dashboard/dashboard.md',
  job: 'sessions_all/sessions_all.md',
  session: 'sessions_all/sessions_all.md',
  'admin-session': 'admin_menu/admin_menu.md#unified-view-for-pending-sessions',
  chat: 'chat/chat.md',
  serving: 'model_serving/model_serving.md',
  service: 'model_serving/model_serving.md',
  import: 'import_run/import_run.md',
  data: 'vfolder/vfolder.md',
  'model-store': 'admin_menu/admin_menu.md#model-store-page',
  'agent-summary': 'agent_summary/agent_summary.md',
  statistics: 'statistics/statistics.md',
  // credential
  credential: 'admin_menu/admin_menu.md#create-and-update-users',
  'credential:users': 'admin_menu/admin_menu.md#create-and-update-users',
  'credential:credentials': 'admin_menu/admin_menu.md#manage-users-keypairs',
  // environment
  environment: 'admin_menu/admin_menu.md#manage-images',
  'environment:image': 'admin_menu/admin_menu.md#manage-images',
  'environment:preset': 'admin_menu/admin_menu.md#manage-resource-preset',
  'environment:registry': 'admin_menu/admin_menu.md#manage-docker-registry',
  // resource-policy
  'resource-policy': 'admin_menu/admin_menu.md#keypair-resource-policy',
  'resource-policy:keypair': 'admin_menu/admin_menu.md#keypair-resource-policy',
  'resource-policy:user': 'admin_menu/admin_menu.md#user-resource-policy',
  'resource-policy:project': 'admin_menu/admin_menu.md#project-resource-policy',
  // scheduler
  scheduler: 'admin_menu/admin_menu.md#fair-share-scheduler',
  // agent (resources)
  agent: 'admin_menu/admin_menu.md#query-agent-nodes',
  'agent:agents': 'admin_menu/admin_menu.md#query-agent-nodes',
  'agent:storages': 'admin_menu/admin_menu.md#storages',
  'agent:resourceGroup': 'admin_menu/admin_menu.md#manage-resource-group',
  // other admin pages
  reservoir: 'admin_menu/admin_menu.md',
  diagnostics: 'admin_menu/admin_menu.md',
  branding: 'admin_menu/admin_menu.md',
  settings: 'admin_menu/admin_menu.md#system-settings',
  maintenance: 'admin_menu/admin_menu.md#server-management',
  information: 'admin_menu/admin_menu.md#detailed-information',
  project: 'admin_menu/admin_menu.md',
  usersettings: 'user_settings/user_settings.md',
  'my-environment': 'my_environments/my_environments.md',
  start: 'start/start.md',
};

/**
 * Maps route keys to the corresponding external docs URL path
 * (for "open in new tab" fallback). Same key format as docPathMatchingTable.
 */
const externalDocMatchingTable: Record<string, string> = {
  '': 'summary/summary.html',
  summary: 'summary/summary.html',
  dashboard: 'dashboard/dashboard.html',
  job: 'sessions_all/sessions_all.html',
  session: 'sessions_all/sessions_all.html',
  'admin-session':
    'admin_menu/admin_menu.html#unified-view-for-pending-sessions',
  chat: 'chat/chat.html',
  serving: 'model_serving/model_serving.html',
  service: 'model_serving/model_serving.html',
  import: 'import_run/import_run.html',
  data: 'vfolder/vfolder.html',
  'model-store': 'admin_menu/admin_menu.html#model-store-page',
  'agent-summary': 'agent_summary/agent_summary.html',
  statistics: 'statistics/statistics.html',
  // credential
  credential: 'admin_menu/admin_menu.html#create-and-update-users',
  'credential:users': 'admin_menu/admin_menu.html#create-and-update-users',
  'credential:credentials': 'admin_menu/admin_menu.html#manage-users-keypairs',
  // environment
  environment: 'admin_menu/admin_menu.html#manage-images',
  'environment:image': 'admin_menu/admin_menu.html#manage-images',
  'environment:preset': 'admin_menu/admin_menu.html#manage-resource-preset',
  'environment:registry': 'admin_menu/admin_menu.html#manage-docker-registry',
  // resource-policy
  'resource-policy': 'admin_menu/admin_menu.html#keypair-resource-policy',
  'resource-policy:keypair':
    'admin_menu/admin_menu.html#keypair-resource-policy',
  'resource-policy:user': 'admin_menu/admin_menu.html#user-resource-policy',
  'resource-policy:project':
    'admin_menu/admin_menu.html#project-resource-policy',
  // scheduler
  scheduler: 'admin_menu/admin_menu.html#fair-share-scheduler',
  // agent (resources)
  agent: 'admin_menu/admin_menu.html#query-agent-nodes',
  'agent:agents': 'admin_menu/admin_menu.html#query-agent-nodes',
  'agent:storages': 'admin_menu/admin_menu.html#storages',
  'agent:resourceGroup': 'admin_menu/admin_menu.html#manage-resource-group',
  // other admin pages
  reservoir: 'admin_menu/admin_menu.html',
  diagnostics: 'admin_menu/admin_menu.html',
  branding: 'admin_menu/admin_menu.html',
  settings: 'admin_menu/admin_menu.html#system-settings',
  maintenance: 'admin_menu/admin_menu.html#server-management',
  information: 'admin_menu/admin_menu.html#detailed-information',
  project: 'admin_menu/admin_menu.html',
  usersettings: 'user_settings/user_settings.html',
  'my-environment': 'my_environments/my_environments.html',
  start: 'start/start.html',
};

interface WEBUIHelpButtonProps extends ButtonProps {}
const WEBUIHelpButton: React.FC<WEBUIHelpButtonProps> = ({ ...props }) => {
  'use memo';
  const { t } = useTranslation();
  const [lang] = useCurrentLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const supportedLang = ['en', 'ko', 'ja', 'th'].includes(lang) ? lang : 'en';
  const routeSegment = location.pathname.split('/')[1] || '';
  const tabParam = new URLSearchParams(location.search).get('tab');
  // Try tab-specific key first (e.g., "credential:users"), then fall back to route-only key
  const matchingKey =
    tabParam && `${routeSegment}:${tabParam}` in docPathMatchingTable
      ? `${routeSegment}:${tabParam}`
      : routeSegment;

  const docPath = docPathMatchingTable[matchingKey] || 'summary/summary.md';

  // External docs site only supports 'en' and 'ko'; fall back to 'en' for other languages.
  const externalDocLang = ['en', 'ko'].includes(supportedLang)
    ? supportedLang
    : 'en';
  const externalDocURL =
    `https://webui.docs.backend.ai/${externalDocLang}/latest/` +
    (externalDocMatchingTable[matchingKey] || '');

  return (
    <>
      <Button
        icon={<QuestionCircleOutlined />}
        type="text"
        aria-label={t('webui.menu.Help')}
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
