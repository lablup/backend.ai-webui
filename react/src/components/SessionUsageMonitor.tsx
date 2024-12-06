import {
  convertBinarySizeUnit,
  convertDecimalSizeUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { knownAcceleratorResourceSlotNames } from '../hooks/backendai';
import Flex from './Flex';
import { ResourceTypeIcon } from './ResourceNumber';
import { SessionUsageMonitorFragment$key } from './__generated__/SessionUsageMonitorFragment.graphql';
import { Col, Progress, ProgressProps, Row, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';

const useStyles = createStyles(({ css, token }) => ({
  progress: css`
    .ant-progress-text {
      font-size: ${token.fontSizeSM} !important;
      min-width: 50px;
    }
    .ant-typography {
      color: ${token.colorTextSecondary} !important;
      font-size: ${token.fontSizeSM}px !important;
    }
  `,
}));

interface SessionUsageMonitorProps extends ProgressProps {
  sessionFrgmt: SessionUsageMonitorFragment$key | null;
  col?: 1 | 2 | 3 | 4;
  showIcon?: boolean;
}

const gridColSpanMap = {
  1: 24,
  2: 12,
  3: 8,
  4: 6,
};

const SessionUsageMonitor: React.FC<SessionUsageMonitorProps> = ({
  sessionFrgmt,
  col = 1,
  showIcon = true,
  ...progressProps
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyles();

  const kernel_nodes = useFragment(
    graphql`
      fragment SessionUsageMonitorFragment on ComputeSessionNode {
        kernel_nodes {
          edges {
            node {
              live_stat
            }
          }
        }
      }
    `,
    sessionFrgmt,
  );

  const liveStat = JSON.parse(
    _.get(kernel_nodes, 'kernel_nodes.edges[0].node.live_stat') ?? '{}',
  );
  // to display util first, mem second
  const sortedLiveStat = useMemo(
    () =>
      Object.keys(liveStat)
        .sort((a, b) => {
          const aUtil = a.includes('_util');
          const bUtil = b.includes('_util');
          const aMem = a.includes('_mem');
          const bMem = b.includes('_mem');

          if (aUtil && !bUtil) return -1;
          if (!aUtil && bUtil) return 1;
          if (aMem && !bMem) return -1;
          if (!aMem && bMem) return 1;

          return 0;
        })
        .reduce((acc: { [key: string]: any }, key) => {
          acc[key] = liveStat[key];
          return acc;
        }, {}),
    [liveStat],
  );

  const mapDeviceToResourceSlotName = (device: string) => {
    const deviceName = device.split('_')[0];
    const resourceSlotName = _.find(
      knownAcceleratorResourceSlotNames,
      (name) => {
        return _.includes(name, deviceName);
      },
    );
    return resourceSlotName;
  };

  return (
    <>
      <Row className={styles.progress} gutter={token.marginSM}>
        {sortedLiveStat?.cpu_util ? (
          <Col
            span={_.get(gridColSpanMap, col)}
            style={{ marginBottom: token.marginXS }}
          >
            <Flex direction="column" align="end">
              <Flex
                align="start"
                gap={token.marginSM}
                style={{ width: '100%' }}
              >
                {showIcon && (
                  <ResourceTypeIcon type={'cpu'} showTooltip={true} />
                )}
                <Progress
                  showInfo
                  status="normal"
                  percent={_.toNumber(
                    toFixedFloorWithoutTrailingZeros(
                      liveStat?.cpu_util?.pct || 0,
                      1,
                    ),
                  )}
                  strokeLinecap="butt"
                  size={progressProps.size ?? { height: token.sizeMD }}
                  strokeColor={token.colorPrimary}
                ></Progress>
              </Flex>
            </Flex>
          </Col>
        ) : null}
        {sortedLiveStat?.mem ? (
          <Col
            span={_.get(gridColSpanMap, col)}
            style={{ marginBottom: token.marginXS }}
          >
            <Flex direction="column" align="end">
              <Flex
                align="start"
                gap={token.marginSM}
                style={{ width: '100%' }}
              >
                {showIcon && (
                  <ResourceTypeIcon type={'mem'} showTooltip={true} />
                )}
                <Progress
                  showInfo
                  status="normal"
                  percent={_.toNumber(
                    toFixedFloorWithoutTrailingZeros(
                      sortedLiveStat?.mem?.pct || 0,
                      1,
                    ),
                  )}
                  strokeLinecap="butt"
                  size={progressProps.size ?? { height: token.sizeMD }}
                  strokeColor={token.colorPrimary}
                ></Progress>
              </Flex>
              <Typography.Text>
                {`(mem) ${
                  convertBinarySizeUnit(sortedLiveStat?.mem?.current, 'g')
                    ?.numberUnit
                }iB
                /
                ${
                  convertBinarySizeUnit(sortedLiveStat?.mem?.capacity, 'g')
                    ?.numberUnit
                }iB`}
              </Typography.Text>
            </Flex>
          </Col>
        ) : null}
        {_.map(_.omit(sortedLiveStat, 'cpu_util', 'mem'), (value, key) => {
          const resourceSlotName = mapDeviceToResourceSlotName(key);
          return resourceSlotName ? (
            <Col
              span={_.get(gridColSpanMap, col)}
              style={{ marginBottom: token.marginXS }}
            >
              <Flex direction="column" align="end">
                <Flex
                  align="start"
                  gap={token.marginSM}
                  style={{ width: '100%' }}
                >
                  {showIcon && (
                    <ResourceTypeIcon
                      type={resourceSlotName}
                      showTooltip={true}
                    />
                  )}
                  <Progress
                    showInfo
                    status="normal"
                    percent={_.toNumber(
                      toFixedFloorWithoutTrailingZeros(
                        sortedLiveStat?.[key]?.pct || 0,
                        1,
                      ),
                    )}
                    strokeLinecap="butt"
                    size={progressProps.size ?? { height: token.sizeMD }}
                    strokeColor={token.colorPrimary}
                  ></Progress>
                </Flex>
                <Typography.Text>
                  {_.includes(key, 'mem') &&
                    `${key.split('_')[0]} (mem) ${convertBinarySizeUnit(sortedLiveStat?.[key]?.current, 'g')?.numberUnit}iB / 
                    ${convertBinarySizeUnit(sortedLiveStat?.[key]?.capacity, 'g')?.numberUnit}iB`}
                </Typography.Text>
              </Flex>
            </Col>
          ) : null;
        })}
      </Row>
      <Flex justify="end" style={{ width: '100%' }}>
        <Typography.Text
          style={{
            fontSize:
              progressProps.size === 'small'
                ? token.fontSizeSM
                : token.fontSize,
          }}
        >
          {`I/O Read: ${convertDecimalSizeUnit(sortedLiveStat?.io_read?.current, 'm')?.numberUnit ?? '-'}B / Write: ${convertDecimalSizeUnit(sortedLiveStat?.io_write?.current, 'm')?.numberUnit ?? '-'}B`}
        </Typography.Text>
      </Flex>
    </>
  );
};

export default SessionUsageMonitor;
