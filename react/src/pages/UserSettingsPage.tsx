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

// import ErrorLogList from '../components/ErrorLogList';
// import Flex from '../components/Flex';
// import UserSettings from '../components/UserSettings';
// import { Card } from 'antd';
// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { useNavigate, useSearchParams } from 'react-router-dom';

// interface UserSettingsProps {}
// const UserSettingsPage: React.FC<UserSettingsProps> = () => {
//   const { t } = useTranslation();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const currentTab = searchParams.get('tab') || 'general';
//   const contentList: Record<string, React.ReactNode> = {
//     general: <UserSettings />,
//     logs: <ErrorLogList />,
//   };

//   return (
//     <>
//       <Flex direction="column" align="stretch" gap={'xs'}>
//         <Flex direction="column" align="stretch">
//           <Card
//             tabList={[
//               {
//                 key: 'general',
//                 tab: t('usersettings.General'),
//               },
//               {
//                 key: 'logs',
//                 tab: t('usersettings.Logs'),
//               },
//             ]}
//             activeTabKey={currentTab}
//             onTabChange={(key) => {
//               navigate(`/usersettings?tab=${key}`);
//             }}
//             bodyStyle={{
//               padding: 0,
//               paddingTop: 1,
//             }}
//           >
//             {contentList[currentTab]}
//           </Card>
//         </Flex>
//       </Flex>
//     </>
//   );
// };

// export default UserSettingsPage;
