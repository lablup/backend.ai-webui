import Flex from '../components/Flex';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { Button, Typography } from 'antd';
import { Trans, useTranslation } from 'react-i18next';

const Page401 = () => {
  const { t } = useTranslation();
  const [isPaliEnabled] = useBAISettingUserState('experimental_PALI') ?? false;
  const webuiNavigate = useWebUINavigate();
  useSuspendedBackendaiClient(); //monkey patch for flickering
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      style={{
        height: 'calc(100vh - 150px)',
      }}
      wrap="wrap"
    >
      <Flex wrap="wrap" justify="center">
        <img
          src="/resources/images/401_unauthorized_access.svg"
          style={{
            width: 500,
            margin: 20,
          }}
          alt="401 Not Found"
        />
        <Flex direction="column" align="start" gap={'lg'}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {/* t('webui.UnauthorizedAccess') */}
            <Trans i18nKey={'webui.UnauthorizedAccess'} />
          </Typography.Title>
          <Typography.Text type="secondary" style={{ margin: 0 }}>
            {/* t('webui.AdminOnlyPage') */}
            <Trans i18nKey={'webui.AdminOnlyPage'} />
          </Typography.Text>
          <Button
            size="large"
            type="primary"
            onClick={() => webuiNavigate('/start')}
          >
            {isPaliEnabled
              ? t('button.GoBackToModelStorePage')
              : t('button.GoBackToSummaryPage')}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Page401;
