import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';

const useStyle = createStyles(({ css }) => ({
  loadingBackground: css`
    transition: opacity 0.3s linear;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    -webkit-user-select: none !important;
    z-index: 9999;
  `,
  loadingBackgroundBefore: css`
    &::before {
      content: '';
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-image: url('/resources/images/loading-background-large.jpg');
      z-index: -1;
      background-repeat: no-repeat;
      background-attachment: fixed;
      background-position: top left;
      filter: var(--theme-image-filter);
    }
  `,
  loadingDragArea: css`
    position: absolute;
    background-color: transparent;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    -webkit-app-region: drag !important;
  `,
  visuallyHidden: css`
    opacity: 0;
  `,
}));

/**
 * LoadingCurtain is the splash screen overlay shown before the user connects to the backend.
 * It listens for the 'backend-ai-connected' event and fades out when the connection is established.
 *
 * This component migrates the loading curtain from the Lit shell's shadow DOM to React,
 * preserving the fade-out transition and Electron drag area functionality.
 */
const LoadingCurtain: React.FC = () => {
  'use memo';

  const { styles, cx } = useStyle();
  const [isVisuallyHidden, setIsVisuallyHidden] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleConnected = () => {
      // Remove background image from body (previously done in Lit shell refreshPage())
      document.body.style.backgroundImage = 'none';
      // Start fade-out transition
      setIsVisuallyHidden(true);
    };

    document.addEventListener('backend-ai-connected', handleConnected);
    return () => {
      document.removeEventListener('backend-ai-connected', handleConnected);
    };
  }, []);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === 'opacity' && isVisuallyHidden) {
      setIsHidden(true);
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <div
      id="loading-curtain"
      className={cx(
        styles.loadingBackground,
        styles.loadingBackgroundBefore,
        isVisuallyHidden && styles.visuallyHidden,
      )}
      onTransitionEnd={handleTransitionEnd}
    >
      <div id="loading-drag-area" className={styles.loadingDragArea} />
    </div>
  );
};

export default LoadingCurtain;
