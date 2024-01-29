import ErrorLogList from '../components/ErrorLogList';
import Flex from '../components/Flex';
import { theme } from 'antd';
import Card from 'antd/es/card/Card';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'general' | 'logs';

const tabParam = withDefault(StringParam, 'general');

const UserSettingPage = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  return (
    <Card
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
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
