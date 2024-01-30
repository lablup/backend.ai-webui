import ErrorLogList from '../components/ErrorLogList';
import Flex from '../components/Flex';
import UserSettings from '../components/UserSettings';
import { Card } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface UserSettingsProps {}
const UserSettingsPage: React.FC<UserSettingsProps> = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'general';
  const contentList: Record<string, React.ReactNode> = {
    general: <UserSettings />,
    logs: <ErrorLogList />,
  };

  return (
    <>
      <Flex direction="column" align="stretch" gap={'xs'}>
        <Flex direction="column" align="stretch">
          <Card
            tabList={[
              {
                key: 'general',
                tab: t('usersettings.General'),
              },
              {
                key: 'logs',
                tab: t('usersettings.Logs'),
              },
            ]}
            activeTabKey={currentTab}
            onTabChange={(key) => {
              navigate(`/usersettings?tab=${key}`);
            }}
            bodyStyle={{
              padding: 0,
              paddingTop: 1,
            }}
          >
            {contentList[currentTab]}
          </Card>
        </Flex>
      </Flex>
    </>
  );
};

export default UserSettingsPage;
