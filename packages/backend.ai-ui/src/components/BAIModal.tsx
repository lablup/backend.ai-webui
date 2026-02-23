// @ts-ignore
import BAIFlex from './BAIFlex';
import { HolderOutlined } from '@ant-design/icons';
import { Modal, theme, type ModalProps } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useState, useRef } from 'react';
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from 'react-draggable';

export const DEFAULT_BAI_MODAL_Z_INDEX = 1001;

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
}

const useStyles = createStyles(
  (
    { css },
    {
      stickyTitle,
      type,
      colorWarning,
      colorError,
    }: {
      stickyTitle: boolean;
      type: 'normal' | 'warning' | 'error';
      colorWarning: string;
      colorError: string;
    },
  ) => ({
    modal: css`
      .ant-modal-wrap.ant-modal-centered {
        overflow: hidden;
      }
      .ant-modal-close {
        width: 26px;
        height: 26px;
        top: 22px;
        right: 18px;
        -webkit-app-region: no-drag;
      }
      .ant-modal-title {
        margin-right: 36px;
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
    `,
  }),
);

const BAIModal: React.FC<BAIModalProps> = ({
  className,
  confirmBeforeClose,
  onConfirmClose,
  stickyTitle = false,
  type = 'normal',
  ...modalProps
}) => {
  'use memo';
  const { token } = theme.useToken();
  const { styles } = useStyles({
    stickyTitle,
    type,
    colorWarning: token.colorWarning,
    colorError: token.colorError,
  });
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  }); //draggable space
  const draggleRef = useRef<HTMLDivElement>(null);

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
    modalProps.onCancel?.(e);
  };

  return (
    <Modal
      {...modalProps}
      centered={modalProps.centered ?? true}
      className={classNames(`bai-modal ${className ?? ''}`, styles.modal)}
      wrapClassName={modalProps.draggable ? 'draggable' : ''}
      onCancel={handleCancel}
      styles={{
        ...modalProps.styles,
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
          maxHeight: 'calc(100vh - 69px - 57px - 48px)',
          overflow: 'auto',
          paddingTop: token.paddingMD,
          paddingBottom: token.paddingMD,
          ...(!_.isFunction(modalProps.styles) && modalProps.styles?.body),
        },
        container: {
          padding: `var(--general-modal-content-padding, 0)`,
          ...(!_.isFunction(modalProps.styles) && modalProps.styles?.container),
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
      }
      modalRender={(modal) =>
        modalProps.draggable ? (
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
        )
      }
      zIndex={DEFAULT_BAI_MODAL_Z_INDEX}
    />
  );
};

export default BAIModal;
