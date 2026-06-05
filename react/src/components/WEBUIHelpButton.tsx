/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentMenuKey } from '../hooks/useRouteScope';
import { useCurrentLanguage } from './DefaultProviders';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';
import React from 'react';

interface WEBUIHelpButtonProps extends ButtonProps {}
const WEBUIHelpButton: React.FC<WEBUIHelpButtonProps> = ({ ...props }) => {
  'use memo';
  const [lang] = useCurrentLanguage();
  // Scope-aware menu key (route handle) keyed the same as `URLMatchingTable`
  // below. Under the new `/admin/<feature>` and `/project/:name/<feature>`
  // URLs the first pathname segment is the scope prefix, so the help-anchor
  // lookup must use the feature/menu key from the matched route instead.
  const matchingKey = useCurrentMenuKey() || '';
  const manualURL = `https://webui.docs.backend.ai/${['en', 'ko'].includes(lang) ? lang : 'en'}/latest/`;
  const URLMatchingTable = {
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
  const URL =
    manualURL +
    (matchingKey
      ? URLMatchingTable[matchingKey as keyof typeof URLMatchingTable] || ''
      : '');

  return (
    <Button
      icon={<QuestionCircleOutlined />}
      type="text"
      target="_blank"
      href={URL}
      {...props}
    />
  );
};

export default WEBUIHelpButton;
