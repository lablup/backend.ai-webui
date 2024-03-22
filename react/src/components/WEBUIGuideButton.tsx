import { CarOutlined } from '@ant-design/icons';
import { StepType, useTour } from '@reactour/tour';
import { Button, ButtonProps } from 'antd';
import React from 'react';
import { useLocation } from 'react-router-dom';

interface WEBUIGuideButtonProps extends ButtonProps {}

const WEBUIGuideButton: React.FC<WEBUIGuideButtonProps> = ({ ...props }) => {
  const { isOpen, setIsOpen, setSteps, steps, setCurrentStep } = useTour();

  const location = useLocation();
  const matchingKey = location.pathname.split('/')[1] || '';

  const sessionLauncherButton = document
    .getElementById('webui-shell')
    ?.shadowRoot?.querySelector('backend-ai-session-view')
    ?.shadowRoot?.querySelector('backend-ai-session-launcher');

  const handleClick = () => {
    setIsOpen(true);
    steps.length === 0 && setSteps?.(URLMatchingSteps[matchingKey] || []);
    setCurrentStep(0);
  };

  const URLMatchingSteps: { [key: string]: StepType[] } = {
    job: [
      {
        selector: '.ant-menu-item-selected',
        content: 'This is the job list page',
      },
      {
        selector: '.ant-alert-info',
        content: 'This is the job list page',
      },
      {
        selector: sessionLauncherButton || 'targetElement',
        content: 'This is the job list page',
      },
    ],
  };

  return (
    <>
      <Button
        size="large"
        icon={<CarOutlined />}
        type="text"
        target="_blank"
        onClick={() => {
          handleClick();
        }}
        {...props}
      />
    </>
  );
};

export default WEBUIGuideButton;
