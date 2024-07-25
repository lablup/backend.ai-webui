import Flex from './Flex';
import { Progress, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css }) => ({
  progress: css`
    .ant-progress-inner {
      border-radius: 4px !important;
    }
    .ant-progress-text {
      margin-left: 6px;
    }
  `,
}));

type ProgressData = {
  current: number | string;
  total: number | string;
};
interface BAIProgressBarProps {
  title: string;
  progressData: Array<ProgressData>;
}

const BAIProgressBar: React.FC<BAIProgressBarProps> = ({
  title,
  progressData,
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyles();

  return (
    <Flex justify="end" align="center" gap={token.marginLG}>
      <Typography.Text strong style={{ flex: 1, textAlign: 'end' }}>
        {title}
      </Typography.Text>
      <Progress
        className={styles.progress}
        percent={50}
        percentPosition={{ align: 'start', type: 'inner' }}
        size={{ height: 20 }}
        strokeLinecap="butt"
        style={{ flex: 3 }}
      />
    </Flex>
  );
};

export default BAIProgressBar;
