// @ts-ignore
import BAIFlex from './BAIFlex';
import {
  BlockOutlined,
  BorderOutlined,
  CloseOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HolderOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { Button, Modal, Tooltip, theme, type ModalProps } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useState, useRef, useEffect } from 'react';
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from 'react-draggable';
import { useTranslation } from 'react-i18next';

export const DEFAULT_BAI_MODAL_Z_INDEX = 1001;

export type WindowState = 'default' | 'minimized' | 'maximized' | 'fullscreen';
export type WindowAction = 'minimize' | 'maximize' | 'fullscreen';
export type MinimizedPlacement =
  | 'bottomRight'
  | 'bottomLeft'
  | 'topRight'
  | 'topLeft';

export interface BAIModalProps extends ModalProps {
  /** Enable dragging modal by header */
  draggable?: boolean;
  /**
   * When true, calls `onConfirmClose` before closing the modal.
   * If `onConfirmClose` returns false or rejects, the close is prevented.
   */
  confirmBeforeClose?: boolean;
  /**
   * Callback invoked before the modal is closed when `confirmBeforeClose` is true.
   * Return false (or a rejected Promise) to prevent closing; return void/true to allow it.
   */
  onConfirmClose?: () => void | boolean | Promise<boolean>;
  /** Makes the modal header sticky so it remains visible when body content is scrolled */
  stickyTitle?: boolean;
  /** Visual variant that changes the header title color */
  type?: 'normal' | 'warning' | 'error';
  /** Control which window actions are available. When provided (non-empty), window controls are rendered in the header. */
  windowActions?: Array<WindowAction>;
  /** Callback when modal window state changes */
  onWindowStateChange?: (state: WindowState) => void;
  /** Placement of the minimized modal bar. Defaults to 'bottomRight'. */
  minimizedPlacement?: MinimizedPlacement;
}

const useStyles = createStyles(
  (
    { css },
    {
      stickyTitle,
      type,
      colorWarning,
      colorError,
      windowState,
      hasWindowControls,
      minimizedPlacement,
      marginLG,
      borderRadiusLG,
      borderRadiusSM,
      controlHeightSM,
      paddingXXS,
      colorTextSecondary,
      colorTextBase,
      colorFillSecondary,
      colorFillTertiary,
    }: {
      stickyTitle: boolean;
      type: 'normal' | 'warning' | 'error';
      colorWarning: string;
      colorError: string;
      windowState: WindowState;
      hasWindowControls: boolean;
      minimizedPlacement: MinimizedPlacement;
      marginLG: number;
      borderRadiusLG: number;
      borderRadiusSM: number;
      controlHeightSM: number;
      paddingXXS: number;
      colorTextSecondary: string;
      colorTextBase: string;
      colorFillSecondary: string;
      colorFillTertiary: string;
    },
  ) => ({
    modal: css`
      .ant-modal-wrap.ant-modal-centered {
        overflow: hidden;
      }
      .ant-modal-close {
        width: ${controlHeightSM}px;
        height: ${controlHeightSM}px;
        top: calc(
          (var(--general-modal-header-height, 69px) - ${controlHeightSM}px) / 2
        );
        right: calc(
          (var(--general-modal-header-height, 69px) - ${controlHeightSM}px) / 2
        );
        -webkit-app-region: no-drag;
      }
      .ant-modal-title {
        margin-right: ${hasWindowControls ? '0' : '36px'};
        ${hasWindowControls ? 'width: 100%; max-width: 100%;' : ''}
        ${type === 'warning' ? `color: ${colorWarning};` : ''}
        ${type === 'error' ? `color: ${colorError};` : ''}
      }
      ${stickyTitle
        ? `
        .ant-modal-header {
          position: sticky;
          top: 0;
          z-index: 1;
          background: var(--ant-color-bg-elevated, #fff);
        }
      `
        : ''}

      ${windowState === 'maximized'
        ? `
        &.ant-modal {
          width: calc(100vw - ${marginLG * 2}px) !important;
          max-width: calc(100vw - ${marginLG * 2}px) !important;
          top: 0;
          padding: 0;
          margin: ${marginLG}px auto;
        }
        .ant-modal-content,
        .ant-modal-container {
          height: calc(100vh - ${marginLG * 2}px);
          display: flex;
          flex-direction: column;
          border-radius: ${borderRadiusLG}px;
        }
        .ant-modal-body {
          flex: 1;
          max-height: none !important;
          overflow: auto;
        }
      `
        : ''}

      ${windowState === 'fullscreen'
        ? `
        &.ant-modal {
          width: 100vw !important;
          max-width: 100vw !important;
          height: 100vh !important;
          top: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .ant-modal-content,
        .ant-modal-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-radius: 0;
        }
        .ant-modal-body {
          flex: 1;
          max-height: none !important;
          overflow: auto;
        }
      `
        : ''}

      ${windowState === 'minimized'
        ? `
        &.ant-modal {
          width: min(320px, calc(100vw - ${marginLG * 2}px)) !important;
          max-width: min(320px, calc(100vw - ${marginLG * 2}px)) !important;
          position: fixed;
          padding: 0;
          margin: 0;
          cursor: pointer;
          pointer-events: auto;
          ${minimizedPlacement.includes('bottom') ? 'top: auto !important; bottom: 0;' : 'top: 0 !important; bottom: auto;'}
          ${minimizedPlacement.includes('Right') ? `right: ${marginLG}px; left: auto;` : `left: ${marginLG}px; right: auto;`}
        }
        .ant-modal-content,
        .ant-modal-container {
          ${minimizedPlacement.includes('bottom') ? `border-radius: ${borderRadiusLG}px ${borderRadiusLG}px 0 0;` : `border-radius: 0 0 ${borderRadiusLG}px ${borderRadiusLG}px;`}
        }
        .ant-modal-header {
          background: transparent !important;
          transition: background-color 0.2s ease;
          border-radius: inherit;
        }
        .ant-modal-header:hover {
          background-color: ${colorFillTertiary} !important;
        }
        .ant-modal-body,
        .ant-modal-footer {
          display: none !important;
        }
        .ant-modal-title {
          max-width: 75%;
          overflow: hidden;
        }
      `
        : ''}

      .ant-modal-content {
        transition:
          height 0.3s ease,
          border-radius 0.3s ease;
      }
    `,
    minimizedTitleContent: css`
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      & * {
        display: inline !important;
        white-space: nowrap !important;
        vertical-align: middle;
      }
    `,
    windowControlsContainer: css`
      display: flex;
      align-items: center;
      gap: ${paddingXXS}px;
      flex-shrink: 0;
      margin-left: auto;
      -webkit-app-region: no-drag;
    `,
    windowControlButton: css`
      &.ant-btn {
        width: ${controlHeightSM}px;
        height: ${controlHeightSM}px;
        min-width: ${controlHeightSM}px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: ${borderRadiusSM}px;
        background: transparent;
        color: ${colorTextSecondary};
        cursor: pointer;
        overflow: hidden;
        transition:
          color 0.2s,
          background-color 0.2s;

        &:hover {
          color: ${colorTextBase};
          background-color: ${colorFillSecondary};
        }
      }
    `,
  }),
);

const BAIModal: React.FC<BAIModalProps> = ({
  className,
  confirmBeforeClose,
  onConfirmClose,
  stickyTitle = false,
  type = 'normal',
  windowActions,
  onWindowStateChange,
  minimizedPlacement = 'bottomRight',
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [windowState, setWindowState] = useState<WindowState>('default');

  // Reset window state when the modal is closed programmatically (e.g., parent sets open={false})
  useEffect(() => {
    if (!modalProps.open && windowState !== 'default') {
      setWindowState('default');
      onWindowStateChange?.('default');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalProps.open]);

  // Override rc-component/portal scroll lock when minimized.
  // The portal injects `html body { overflow-y: hidden }` via a <style> tag.
  // We counter it with a higher-specificity rule.
  useEffect(() => {
    if (windowState === 'minimized' && modalProps.open) {
      const styleId = 'bai-modal-minimized-scroll-unlock';
      let style = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      style.textContent = 'html body { overflow-y: auto !important; }';
      return () => {
        style?.remove();
      };
    }
  }, [windowState, modalProps.open]);

  const hasWindowControls = windowActions && windowActions.length > 0;
  const activeActions: WindowAction[] = windowActions ?? [];

  const { styles } = useStyles({
    stickyTitle,
    type,
    colorWarning: token.colorWarning,
    colorError: token.colorError,
    windowState: hasWindowControls ? windowState : 'default',
    hasWindowControls: !!hasWindowControls,
    minimizedPlacement,
    marginLG: token.marginLG,
    borderRadiusLG: token.borderRadiusLG,
    borderRadiusSM: token.borderRadiusSM,
    controlHeightSM: token.controlHeightSM,
    paddingXXS: token.paddingXXS,
    colorTextSecondary: token.colorTextSecondary,
    colorTextBase: token.colorTextBase,
    colorFillSecondary: token.colorFillSecondary,
    colorFillTertiary: token.colorFillTertiary,
  });
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  }); //draggable space
  const draggleRef = useRef<HTMLDivElement>(null);

  const handleWindowStateChange = (action: WindowAction) => {
    const targetState: WindowState =
      action === 'minimize'
        ? 'minimized'
        : action === 'maximize'
          ? 'maximized'
          : 'fullscreen';

    const newState = windowState === targetState ? 'default' : targetState;
    setWindowState(newState);
    onWindowStateChange?.(newState);
  };

  const handleDrag = (_e: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement; //browserWidth, browserHeight
    const targetRect = draggleRef.current?.getBoundingClientRect(); //Modal size and viewport
    if (!targetRect) {
      return;
    }
    setBounds({
      left: uiData.x - targetRect.left,
      right:
        clientWidth - (targetRect.right - uiData.x) + (targetRect.width - 44), // 44 is sum of draggable icon width, gap and padding
      top: -targetRect.top + uiData.y,
      bottom:
        clientHeight -
        (targetRect.bottom - uiData.y) +
        (targetRect.height - 69), // 69 is height of modal header
    });
  };

  const handleCancel: ModalProps['onCancel'] = async (e) => {
    if (confirmBeforeClose && onConfirmClose) {
      try {
        const result = await Promise.resolve(onConfirmClose());
        if (result === false) {
          return;
        }
      } catch {
        return;
      }
    }
    // Reset window state when closing
    if (windowState !== 'default') {
      setWindowState('default');
      onWindowStateChange?.('default');
    }
    modalProps.onCancel?.(e);
  };

  const isDraggingDisabled =
    windowState === 'maximized' || windowState === 'fullscreen';

  const renderWindowControls = () => {
    if (!hasWindowControls) return null;
    if (windowState === 'minimized') return null;

    return (
      <div className={styles.windowControlsContainer}>
        {activeActions.includes('minimize') && (
          <Tooltip title={t('comp:BAIModal.Minimize')}>
            <Button
              className={styles.windowControlButton}
              type="text"
              size="small"
              icon={<MinusOutlined />}
              onClick={() => handleWindowStateChange('minimize')}
              aria-label={t('comp:BAIModal.Minimize')}
            />
          </Tooltip>
        )}
        {activeActions.includes('maximize') && (
          <Tooltip
            title={
              windowState === 'maximized'
                ? t('comp:BAIModal.Restore')
                : t('comp:BAIModal.Maximize')
            }
          >
            <Button
              className={styles.windowControlButton}
              type="text"
              size="small"
              icon={
                windowState === 'maximized' ? (
                  <BlockOutlined />
                ) : (
                  <BorderOutlined />
                )
              }
              onClick={() => handleWindowStateChange('maximize')}
              aria-label={
                windowState === 'maximized'
                  ? t('comp:BAIModal.Restore')
                  : t('comp:BAIModal.Maximize')
              }
            />
          </Tooltip>
        )}
        {activeActions.includes('fullscreen') && (
          <Tooltip
            title={
              windowState === 'fullscreen'
                ? t('comp:BAIModal.ExitFullscreen')
                : t('comp:BAIModal.Fullscreen')
            }
          >
            <Button
              className={styles.windowControlButton}
              type="text"
              size="small"
              icon={
                windowState === 'fullscreen' ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )
              }
              onClick={() => handleWindowStateChange('fullscreen')}
              aria-label={
                windowState === 'fullscreen'
                  ? t('comp:BAIModal.ExitFullscreen')
                  : t('comp:BAIModal.Fullscreen')
              }
            />
          </Tooltip>
        )}
        {modalProps.closable !== false && (
          <Tooltip title={t('general.button.Close')}>
            <Button
              className={styles.windowControlButton}
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={(e) =>
                handleCancel(
                  e as unknown as React.MouseEvent<HTMLButtonElement>,
                )
              }
              aria-label={t('general.button.Close')}
            />
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <Modal
      {...modalProps}
      centered={
        windowState === 'default' ? (modalProps.centered ?? true) : false
      }
      className={classNames(`bai-modal ${className ?? ''}`, styles.modal)}
      wrapClassName={classNames(
        modalProps.draggable && !isDraggingDisabled ? 'draggable' : '',
        windowState === 'maximized' ? 'bai-modal-maximized' : '',
        windowState === 'fullscreen' ? 'bai-modal-fullscreen' : '',
        windowState === 'minimized' ? 'bai-modal-minimized' : '',
      )}
      onCancel={handleCancel}
      closable={hasWindowControls ? false : modalProps.closable}
      mask={
        windowState === 'minimized'
          ? false
          : typeof modalProps.mask === 'object'
            ? {
                blur: false,
                ...modalProps.mask,
                closable:
                  modalProps.mask?.closable ?? modalProps.maskClosable ?? true,
              }
            : {
                blur: false,
                enabled: modalProps.mask ?? true,
                closable: modalProps.maskClosable ?? true,
              }
      }
      styles={{
        ...modalProps.styles,
        wrapper: {
          ...(!_.isFunction(modalProps.styles) && modalProps.styles?.wrapper),
          ...(windowState === 'maximized'
            ? {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }
            : {}),
          ...(windowState === 'fullscreen'
            ? {
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                overflow: 'hidden',
              }
            : {}),
          ...(windowState === 'minimized'
            ? {
                pointerEvents: 'none' as const,
                overflow: 'hidden',
              }
            : {}),
        },
        header: {
          marginBottom: 0,
          borderBottom: `1px solid var(--token-colorBorder, ${token.colorBorder})`,
          borderWidth: '100%',
          justifyContent: 'space-between',
          display: 'flex',
          alignItems: 'center',
          height: 'var(--general-modal-header-height, 69px)',
          padding: 'var(--general-modal-header-padding, 10px 24px)',
          ...(!_.isFunction(modalProps.styles) && modalProps.styles?.header),
        },
        body: {
          padding: `var(--general-modal-body-padding, 0 24px)`,
          maxHeight:
            windowState === 'default'
              ? `calc(100vh - var(--general-modal-header-height, 69px) - ${token.controlHeight + token.paddingSM * 2 + token.lineWidth}px - ${token.marginLG * 2}px)`
              : 'none',
          overflow: 'auto',
          paddingTop: token.paddingMD,
          paddingBottom: token.paddingMD,
          ...(!_.isFunction(modalProps.styles) && modalProps.styles?.body),
          ...(windowState !== 'default' ? { flex: 1, maxHeight: 'none' } : {}),
        },
        container: {
          padding: `var(--general-modal-content-padding, 0)`,
          ...(!_.isFunction(modalProps.styles) && modalProps.styles?.container),
          ...(windowState === 'maximized'
            ? {
                height: `calc(100vh - ${token.marginLG * 2}px)`,
                display: 'flex',
                flexDirection: 'column' as const,
              }
            : {}),
          ...(windowState === 'fullscreen'
            ? {
                height: '100vh',
                display: 'flex',
                flexDirection: 'column' as const,
                borderRadius: 0,
              }
            : {}),
        },
        footer: {
          borderTop: '1px solid',
          borderColor: token.colorBorder,
          padding: token.paddingSM,
          paddingLeft: token.paddingMD,
          paddingRight: token.paddingMD,
          marginTop: 0,
          ...(!_.isFunction(modalProps.styles) && modalProps.styles?.footer),
        },
      }}
      title={
        hasWindowControls ? (
          <BAIFlex
            gap={'xs'}
            justify="between"
            align="center"
            style={{ width: '100%', overflow: 'hidden' }}
          >
            <BAIFlex gap={'xs'} style={{ overflow: 'hidden', flex: 1 }}>
              <HolderOutlined
                style={{
                  cursor:
                    modalProps.draggable && !isDraggingDisabled ? 'move' : '',
                  display: !modalProps.draggable ? 'none' : '',
                  // @ts-ignore
                  '-webkit-app-region': 'no-drag',
                }}
                onMouseOver={() => {
                  if (disabled && !isDraggingDisabled) {
                    setDisabled(false);
                  }
                }}
                onMouseLeave={() => {
                  setDisabled(true);
                }}
              />
              <div
                className={
                  windowState === 'minimized'
                    ? styles.minimizedTitleContent
                    : undefined
                }
                style={{
                  overflow: 'hidden',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {modalProps.title}
              </div>
            </BAIFlex>
            {renderWindowControls()}
          </BAIFlex>
        ) : (
          <BAIFlex gap={'xs'}>
            <HolderOutlined
              style={{
                cursor: modalProps.draggable ? 'move' : '',
                display: !modalProps.draggable ? 'none' : '',
                // @ts-ignore
                '-webkit-app-region': 'no-drag',
              }}
              onMouseOver={() => {
                if (disabled) {
                  setDisabled(false);
                }
              }}
              onMouseLeave={() => {
                setDisabled(true);
              }}
            />
            {modalProps.title}
          </BAIFlex>
        )
      }
      modalRender={(modal) => {
        if (windowState === 'minimized') {
          return (
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleWindowStateChange('minimize')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleWindowStateChange('minimize');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {modal}
            </div>
          );
        }

        return modalProps.draggable && !isDraggingDisabled ? (
          <Draggable
            disabled={disabled}
            bounds={bounds}
            nodeRef={draggleRef}
            onStart={(e, uiData) => handleDrag(e, uiData)}
          >
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        ) : (
          modal
        );
      }}
      zIndex={DEFAULT_BAI_MODAL_Z_INDEX}
    />
  );
};

export default BAIModal;
