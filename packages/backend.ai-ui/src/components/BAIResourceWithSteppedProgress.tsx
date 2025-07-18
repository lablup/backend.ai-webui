import Flex from './Flex';
import { theme, Typography, Tooltip } from 'antd';
import _ from 'lodash';

export interface BAIResourceWithSteppedProgressProps {
  title: string;
  current: number;
  total?: number;
  unit: string;
  steps?: number;
  unlimitedValues?: Array<number | string>;
  showProgress?: boolean;
}

const BAIResourceWithSteppedProgress: React.FC<
  BAIResourceWithSteppedProgressProps
> = ({
  title,
  current,
  total,
  unit,
  steps = 12,
  unlimitedValues,
  showProgress = true,
}) => {
  const { token } = theme.useToken();

  const formattedCurrent = _.includes(unlimitedValues, current)
    ? '∞'
    : _.isNaN(current)
      ? '-'
      : current;
  const formattedTotal = _.includes(unlimitedValues, total) ? '∞' : total;

  return (
    <Flex direction="column" align="start">
      <Typography.Text
        style={{
          fontSize: token.fontSizeLG,
          fontWeight: 600,
          marginBottom: 16,
          lineHeight: '1em',
        }}
      >
        {title}
      </Typography.Text>
      <Flex
        direction="row"
        gap="xxs"
        align="end"
        style={{
          marginBottom: 8,
        }}
      >
        <Typography.Text
          style={{
            fontSize: 32,
            lineHeight: '1em',
            fontWeight: 700,
            color: token.colorSuccess,
          }}
        >
          {formattedCurrent}
        </Typography.Text>
        {!_.isNaN(current) && <Typography.Text>{unit}</Typography.Text>}
      </Flex>
      {showProgress && (
        <Tooltip
          title={`${formattedCurrent} ${unit} / ${formattedTotal} ${unit}`}
        >
          <Flex direction="row" gap={2}>
            {_.map(_.range(steps), (i) => {
              let currentPosition;
              if (_.includes(unlimitedValues, current) || total === 0) {
                currentPosition = 100;
              } else if (
                !_.includes(unlimitedValues, current) &&
                _.includes(unlimitedValues, total)
              ) {
                currentPosition = 0;
              } else {
                currentPosition = total ? (current / total) * steps : 0;
              }

              return (
                <Flex
                  key={i}
                  style={{
                    width: 5,
                    height: 12,
                    borderRadius: 2.5,
                    backgroundColor:
                      i < currentPosition
                        ? token.colorSuccess
                        : token.colorTextDisabled,
                  }}
                />
              );
            })}
          </Flex>
        </Tooltip>
      )}
    </Flex>
  );
};

export default BAIResourceWithSteppedProgress;
