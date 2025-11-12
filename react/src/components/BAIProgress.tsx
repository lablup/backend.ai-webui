import usePrimaryColors from '../hooks/usePrimaryColors';
import { ProgressProps, theme, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
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
  const primaryColors = usePrimaryColors();

  return (
    <BAIFlex direction="column" align="stretch" gap={'xs'}>
      <BAIFlex align="stretch" justify={title ? 'between' : 'end'}>
        <Typography.Text style={{ alignContent: 'end' }}>
          {title}
        </Typography.Text>
        <Typography.Text
          style={{
            fontSize: token.fontSizeHeading3,
            color: _.isString(baiProgressProps.strokeColor)
              ? baiProgressProps.strokeColor
              : primaryColors.primary5,
            alignContent: 'end',
          }}
        >
          {baiProgressProps.percent ?? 0}%
        </Typography.Text>
      </BAIFlex>
      <BAIFlex
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
        <BAIFlex
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
                primaryColors.primary5 ??
                token.colorPrimary)
              : (primaryColors.primary5 ?? token.colorPrimary),
            zIndex: 0,
            overflow: 'hidden',
          }}
        ></BAIFlex>
      </BAIFlex>
      <BAIFlex justify="end">
        {used && total && baiProgressProps.percent ? (
          <BAIFlex gap={'xxs'}>
            <Typography.Text
              style={{
                color: _.isString(baiProgressProps.strokeColor)
                  ? (baiProgressProps.strokeColor ??
                    primaryColors.primary5 ??
                    token.colorPrimary)
                  : (primaryColors.primary5 ?? token.colorPrimary),
              }}
            >
              {used}
            </Typography.Text>
            <Typography.Text>/</Typography.Text>
            <Typography.Text>{total}</Typography.Text>
          </BAIFlex>
        ) : total ? (
          <Typography.Text>{total}</Typography.Text>
        ) : null}
      </BAIFlex>
    </BAIFlex>
  );
};

export default BAIProgress;
