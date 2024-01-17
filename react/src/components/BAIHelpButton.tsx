import BAIHelpDrawer from './BAIHelpDrawer';
import { useCurrentLanguage } from './DefaultProviders';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, ButtonProps } from 'antd';
import React from 'react';
import { useLocation } from 'react-router-dom';

interface BAIHelpButtonProps extends ButtonProps {}
const BAIHelpButton: React.FC<BAIHelpButtonProps> = ({ ...props }) => {
  const [isOpenDrawer, { toggle: toggleDrawer }] = useToggle();
  const [lang] = useCurrentLanguage();
  const location = useLocation();

  return (
    <>
      <Button
        size="large"
        icon={<QuestionCircleOutlined />}
        type="text"
        onClick={toggleDrawer}
        {...props}
      />
      <BAIHelpDrawer
        open={isOpenDrawer}
        onClose={toggleDrawer}
        manualURL={`https://webui.docs.backend.ai/${lang}/latest/`}
        URLMatchingTable={{
          '': 'summary/summary.html',
          summary: 'summary/summary.html',
          job: 'sessions_all/sessions_all.html',
          serving: 'model_serving/model_serving.html',
          import: 'import_run/import_run.html',
          data: 'vfolder/vfolder.html',
          statistics: 'statistics/statistics.html',
          credential: 'admin_menu/admin_menu.html',
          environment: 'admin_menu/admin_menu.html#manage-images',
          agent: 'admin_menu/admin_menu.html#query-agent-nodes',
          settings: 'admin_menu/admin_menu.html#system-settings',
          mainetenance: 'admin_menu/admin_menu.html#server-management',
          information: 'admin_menu/admin_menu.html#detailed-information',
          usersettings: 'user_settings/user_settings.html',
        }}
        matchingKey={location.pathname.split('/')[1] || ''}
      />
    </>
  );
};

export default BAIHelpButton;
