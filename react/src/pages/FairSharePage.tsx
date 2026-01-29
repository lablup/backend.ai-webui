import { QuestionCircleOutlined } from '@ant-design/icons';
import { theme, Tooltip } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import FairShareList from 'src/components/FairShareItems/FairShareList';

const FairSharePage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <BAICard
      activeTabKey="scheduler"
      tabList={[
        {
          key: 'scheduler',
          tab: (
            <BAIFlex gap="xxs">
              {t('fairShare.Scheduler')}
              <Tooltip
                title={<Trans i18nKey={t('fairShare.SchedulerDescription')} />}
              >
                <QuestionCircleOutlined style={{ fontSize: token.fontSize }} />
              </Tooltip>
            </BAIFlex>
          ),
        },
      ]}
    >
      <FairShareList />
    </BAICard>
  );
};

export default FairSharePage;
