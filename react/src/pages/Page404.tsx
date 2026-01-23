import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import {
  getPathFromMenuKey,
  useWebUIMenuItems,
} from '../hooks/useWebUIMenuItems';
import { Button, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { Trans, useTranslation } from 'react-i18next';

const Page404 = () => {
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const { firstAvailableMenuItem } = useWebUIMenuItems();
  useSuspendedBackendaiClient(); //monkey patch for flickering

  const defaultPagePath = firstAvailableMenuItem
    ? getPathFromMenuKey(firstAvailableMenuItem.key)
    : '/start';
  const defaultPageTitle =
    firstAvailableMenuItem?.labelText ?? t('webui.menu.FirstPageNameAlias');

  return (
    <BAIFlex
      direction="column"
      justify="center"
      align="center"
      style={{
        height: 'calc(100vh - 150px)',
      }}
      wrap="wrap"
    >
      <BAIFlex wrap="wrap" justify="center">
        <img
          src="/resources/images/404_not_found.svg"
          // style="width:500px;margin:20px;"
          style={{
            width: 500,
            margin: 20,
          }}
          alt="404 Not Found"
        />
        <BAIFlex direction="column" align="start" gap={'lg'}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {/* t('webui.NotFound') */}
            <Trans i18nKey={'webui.NotFound'} />
          </Typography.Title>
          <Typography.Text type="secondary" style={{ margin: 0 }}>
            {t('webui.DescNotFound')}
          </Typography.Text>
          <Button
            size="large"
            type="primary"
            onClick={() => webuiNavigate(defaultPagePath)}
          >
            {t('button.GoBackToStartPage', { title: defaultPageTitle })}
          </Button>
        </BAIFlex>
      </BAIFlex>
    </BAIFlex>
  );
};

export default Page404;
