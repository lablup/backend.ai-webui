import Flex from './Flex';
import { CloseOutlined, LogoutOutlined } from '@ant-design/icons';
import { MaskStylesObj } from '@reactour/mask';
import { PopoverStylesObj } from '@reactour/popover';
import { StylesObj, TourProvider } from '@reactour/tour';
import { Button, Typography, theme } from 'antd';
import { toLength } from 'lodash';
import React from 'react';

const TourHeader: React.FC = (props) => {
  const { token } = theme.useToken();
  return (
    <Flex style={{ width: '100%' }} justify="end">
      <Button
        type="text"
        icon={<CloseOutlined />}
        style={{ color: token.colorIcon }}
        onClick={() => {
          // @ts-ignore
          props.setIsOpen(false);
        }}
      ></Button>
    </Flex>
  );
};
const TourContent: React.FC = (props) => {
  const { token } = theme.useToken();
  return (
    <Flex
      direction="column"
      gap={token.paddingXS}
      style={{ minWidth: 250, padding: token.paddingXS }}
      align="start"
    >
      <TourHeader {...props} />
      <Typography.Text style={{ paddingLeft: token.paddingXS }}>
        {
          // @ts-ignore
          props.steps[props.currentStep].content
        }
      </Typography.Text>
      <TourFooter {...props} />
    </Flex>
  );
};
const TourFooter: React.FC = (props) => {
  const { token } = theme.useToken();
  return (
    <Flex
      justify="between"
      align="end"
      style={{ width: '100%', padding: token.paddingXS }}
    >
      <Typography.Text>
        {`${
          // @ts-ignore
          props.currentStep + 1
        } / ${
          // @ts-ignore
          props.steps.length
        }`}
      </Typography.Text>
      <Flex gap={'xxs'}>
        {
          // @ts-ignore
          props.currentStep !== 0 && (
            <Button
              style={{
                height: token.controlHeightSM,
                padding: 4,
                borderRadius: token.borderRadiusSM,
                lineHeight: 'var(--ant-button-content-line-height-sm)',
              }}
              onClick={() => {
                // @ts-ignore.ant-btn-sm {}
                props.setCurrentStep((prev) => prev - 1);
                // @ts-ignore
              }}
            >
              Previous
            </Button>
          )
        }
        {
          // @ts-ignore
          props.currentStep !== props.steps.length - 1 && (
            <Button
              style={{
                backgroundColor: 'var(--token-colorPrimary)',
                color: token.colorWhite,
                border: 'none',
                boxShadow: token.boxShadowTertiary,
                height: token.controlHeightSM,
                padding: 4,
                borderRadius: token.borderRadiusSM,
                lineHeight: 'var(--ant-button-content-line-height-sm)',
              }}
              onClick={() => {
                // @ts-ignore.ant-btn-sm {}
                props.setCurrentStep((prev) => prev + 1);
                // @ts-ignore
                if (props.steps.length === props.currentStep + 1) {
                  // @ts-ignore
                  props.setIsOpen(false);
                }
              }}
            >
              Next
            </Button>
          )
        }
      </Flex>
    </Flex>
  );
};

interface BAITourProviderProps extends React.PropsWithChildren<{}> {}
const BAITourProvider: React.FC<BAITourProviderProps> = ({ children }) => {
  const { token } = theme.useToken();
  const styles: StylesObj & PopoverStylesObj & MaskStylesObj = {
    popover: (base) => ({
      ...base,
      borderRadius: token.borderRadius,
      padding: 0,
    }),
  };

  return (
    <TourProvider
      steps={[]}
      ContentComponent={TourContent}
      styles={styles}
      showBadge={false}
    >
      {children}
    </TourProvider>
  );
};

export default BAITourProvider;
