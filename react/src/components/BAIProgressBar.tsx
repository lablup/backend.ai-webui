import Flex from './Flex';
import { Progress, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';

const useStyles = createStyles(({ css }) => {
  const defaultProgressCSS = css`
    .ant-progress-inner {
      border-radius: 4px !important;
    }
    .ant-progress-text {
      margin-left: 6px;
    }
  `;
  return {
    progress: css`
      ${defaultProgressCSS}
    `,
    emptyProgress: css`
      ${defaultProgressCSS}
      .ant-progress-bg {
        background-color: unset !important;
      }
    `,
  };
});

interface BAIProgressBarProps {
  max: number;
  current: number;
  prefix?: string;
  showPercentage?: boolean;
  color?: string;
  style?: React.CSSProperties;
}

const BAIProgressBar: React.FC<BAIProgressBarProps> = ({
  max,
  current,
  prefix,
  showPercentage = false,
  color,
  style,
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyles();
  //TODO: percentage 계산을 내부에서 하는게 맞는지 확인
  const percentage = max ? Math.round((current / max) * 100) : 0;

  //TODO: progress 내부 텍스트만큼 백그라우드가 먹는 문제 해결

  return (
    <Flex gap={token.marginXS} style={{ width: 'inherit', ...style }}>
      <Progress
        className={percentage ? styles.progress : styles.emptyProgress}
        style={{
          flex: 6,
          fontSize: token.fontSizeSM,
        }}
        size={{ height: 18 }}
        percent={percentage}
        percentPosition={{ align: 'start', type: 'inner' }}
        strokeLinecap="butt"
        strokeColor={color ?? token.colorPrimary}
        format={() => (
          <Typography.Text
            style={{
              fontSize: token.fontSizeSM,
              color: percentage ? token.colorWhite : undefined,
            }}
          >
            {current}/{max} {prefix}
          </Typography.Text>
        )}
      />
      {showPercentage && (
        <Typography.Text
          type="secondary"
          style={{ flex: 1, whiteSpace: 'nowrap', fontSize: token.fontSizeSM }}
        >
          {showPercentage && percentage + '%'}
        </Typography.Text>
      )}
    </Flex>
  );
};

export default BAIProgressBar;
