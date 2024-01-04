import {
  useCurrentDomainValue,
  useCurrentProjectValue,
  useSuspendedBackendaiClient,
} from '../../hooks';
import Flex from '../Flex';
import ProjectSelector from '../ProjectSelector';
import UserDropdownMenu from '../UserDropdownMenu';
import { BellOutlined, MenuOutlined } from '@ant-design/icons';
import { theme, Layout, Button, Typography } from 'antd';
import { t } from 'i18next';
import _ from 'lodash';
import { Suspense } from 'react';
import { useMatches } from 'react-router-dom';

const WebUIHeader: React.FC<{
  onClickMenuIcon?: () => void;
}> = ({ onClickMenuIcon }) => {
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomainName = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const matches = useMatches();

  return (
    <Layout.Header
      style={{
        position: 'sticky',
        height: 64,
        top: 0,
        zIndex: 1,
        // width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: token.marginMD,
        paddingRight: token.marginMD,
        // margin: token.marginMD * -1,
        backgroundColor: token.colorBgContainer,
        // borderBottom: `1px solid ${token.colorBorder}`,
      }}
    >
      <Flex direction="row" gap={'sm'}>
        <Button
          icon={<MenuOutlined />}
          type="text"
          onClick={() => {
            onClickMenuIcon?.();
          }}
        />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {/* @ts-ignore */}
          {t(_.last(matches)?.handle?.labelKey) || ''}
        </Typography.Title>
      </Flex>
      <Flex gap={'sm'}>
        <Typography.Text type="secondary">
          {t('webui.menu.Project')}
        </Typography.Text>
        <Suspense>
          <ProjectSelector
            style={{ minWidth: 150 }}
            showSearch
            domain={currentDomainName}
            size="large"
            value={currentProject?.id}
            onChange={(value) => {
              const event: CustomEvent = new CustomEvent(
                'backend-ai-group-changed',
                {
                  detail: value,
                },
              );
              document.dispatchEvent(event);
            }}
          />
        </Suspense>

        <Flex direction="row">
          <Button size="large" icon={<BellOutlined />} type="text"></Button>
          <UserDropdownMenu />
        </Flex>
      </Flex>
    </Layout.Header>
  );
};

export default WebUIHeader;
