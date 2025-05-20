import { useCurrentLanguage } from './DefaultProviders';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import React from 'react';
import { useLocation } from 'react-router-dom';

interface WEBUIHelpButtonProps extends ButtonProps {}
const WEBUIHelpButton: React.FC<WEBUIHelpButtonProps> = ({ ...props }) => {
  const [lang] = useCurrentLanguage();
  const location = useLocation();
  const manualURL = `https://webui.docs.backend.ai/${['en', 'ko'].includes(lang) ? lang : 'en'}/latest/`;
  const matchingKey = location.pathname.split('/')[1] || '';
  const URLMatchingTable = {
    '': 'summary/summary.html',
    summary: 'summary/summary.html',
    job: 'sessions_all/sessions_all.html',
    serving: 'model_serving/model_serving.html',
    service: 'model_serving/model_serving.html',
    import: 'import_run/import_run.html',
    data: 'vfolder/vfolder.html',
    statistics: 'statistics/statistics.html',
    credential: 'admin_menu/admin_menu.html',
    environment: 'admin_menu/admin_menu.html#manage-images',
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
