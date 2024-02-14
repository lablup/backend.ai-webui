import ErrorLogList from '../components/ErrorLogList';
import Flex from '../components/Flex';
import { useWebUINavigate } from '../hooks';
import { theme } from 'antd';
import Card from 'antd/es/card/Card';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const tabParam = withDefault(StringParam, 'general');

const UserSettingPage = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webUINavigate = useWebUINavigate();
  const [curTabKey] = useQueryParam('tab', tabParam);
  return (
    <Card
      activeTabKey={curTabKey}
      onTabChange={(key) => {
        webUINavigate(
          {
            pathname: '/usersettings',
            search: `?tab=${key}`,
          },
          // Pass the tab as a `params` to update the tab in backend-ai-usersettings
          {
            params: {
              tab: key,
            },
          },
        );
      }}
      tabList={[
        {
          key: 'general',
          label: t('usersettings.General'),
        },
        {
          key: 'logs',
          label: t('usersettings.Logs'),
        },
      ]}
      bodyStyle={{
        padding: 0,
      }}
    >
      <Flex
        style={{
          display: curTabKey === 'general' ? 'block' : 'none',
          paddingTop: token.paddingContentVerticalSM,
          paddingBottom: token.paddingContentVerticalLG,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
      >
        {/* @ts-ignore */}
        <backend-ai-usersettings-general-list
          active={curTabKey === 'general'}
        />
      </Flex>
      {curTabKey === 'logs' && <ErrorLogList />}
    </Card>
  );
};

export default UserSettingPage;
