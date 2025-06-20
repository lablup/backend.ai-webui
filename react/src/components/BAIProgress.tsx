import Flex from './Flex';
import { ProgressProps, theme, Typography } from 'antd';
import _ from 'lodash';
import React, { ReactNode } from 'react';

interface BAIProgressProps extends ProgressProps {
  title?: ReactNode;
  used?: number | string;
  total?: number | string;
  progressStyle?: React.CSSProperties;
}

const BAIProgress: React.FC<BAIProgressProps> = ({
  title,
  used,
  total,
  progressStyle,
  ...baiProgressProps
}) => {
  const { token } = theme.useToken();

  return (
    <Flex direction="column" align="stretch" gap={'xs'}>
      <Flex align="stretch" justify={title ? 'between' : 'end'}>
        <Typography.Text style={{ alignContent: 'end' }}>
          {title}
        </Typography.Text>
        <Typography.Text
          style={{
            fontSize: token.fontSizeHeading3,
            color: _.isString(baiProgressProps.strokeColor)
              ? baiProgressProps.strokeColor
              : token.Layout?.headerBg,
            alignContent: 'end',
          }}
        >
          {baiProgressProps.percent ?? 0}%
        </Typography.Text>
      </Flex>
      <Flex
        style={{
          padding: 1,
          backgroundColor: token.colorFill,
          height: _.isNumber(baiProgressProps.size)
            ? baiProgressProps.size
            : token.size,
          ...progressStyle,
        }}
        direction="column"
        align="stretch"
      >
        <Flex
          style={{
            height: _.isNumber(baiProgressProps.size)
              ? baiProgressProps.size
              : token.size,
            width: `${!baiProgressProps.percent || _.isNaN(baiProgressProps.percent) ? 0 : _.min([baiProgressProps.percent, 100])}%`,
            position: 'absolute',
            left: 0,
            top: 0,
            backgroundColor: _.isString(baiProgressProps.strokeColor)
              ? (baiProgressProps.strokeColor ??
                token.Layout?.headerBg ??
                token.colorPrimary)
              : (token.Layout?.headerBg ?? token.colorPrimary),
            zIndex: 0,
            overflow: 'hidden',
          }}
        ></Flex>
        {/* Hide used text to avoid overlapping */}
        {used && baiProgressProps.percent && baiProgressProps.percent < 70 ? (
          <div
            style={{
              position: 'absolute',
              left:
                !baiProgressProps.percent || _.isNaN(baiProgressProps.percent)
                  ? 0
                  : `calc(${_.min([baiProgressProps.percent, 100])}% - ${token.size}px)`,
              bottom: -(token.size + token.fontSize),
              textAlign: 'center',
            }}
          >
            <Typography.Text
              style={{
                color: _.isString(baiProgressProps.strokeColor)
                  ? (baiProgressProps.strokeColor ??
                    token.Layout?.headerBg ??
                    token.colorPrimary)
                  : (token.Layout?.headerBg ?? token.colorPrimary),
              }}
            >
              {used}
            </Typography.Text>
          </div>
        ) : null}
      </Flex>
      <Flex justify="end">
        {used &&
        total &&
        baiProgressProps.percent &&
        baiProgressProps.percent >= 70 ? (
          <Flex gap={'xxs'}>
            <Typography.Text
              style={{
                color: _.isString(baiProgressProps.strokeColor)
                  ? (baiProgressProps.strokeColor ??
                    token.Layout?.headerBg ??
                    token.colorPrimary)
                  : (token.Layout?.headerBg ?? token.colorPrimary),
              }}
            >
              {used}
            </Typography.Text>
            <Typography.Text>/</Typography.Text>
            <Typography.Text>{total}</Typography.Text>
          </Flex>
        ) : total ? (
          <Typography.Text>{total}</Typography.Text>
        ) : null}
      </Flex>
    </Flex>
  );
};

export default BAIProgress;
