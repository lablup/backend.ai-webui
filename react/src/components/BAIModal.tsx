import useControllableState from '../hooks/useControllableState';
// @ts-ignore
import rawBAIModalCss from './BAIModal.css?raw';
import { HolderOutlined } from '@ant-design/icons';
import { Modal, ModalProps, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useState, useRef, useEffect } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';

export const DEFAULT_BAI_MODAL_Z_INDEX = 1001;
export interface BAIModalProps extends ModalProps {
  draggable?: boolean; // modal can be draggle
}
const BAIModal: React.FC<BAIModalProps> = ({
  className,
  styles,
  keyboard,
  ...modalProps
}) => {
  const { token } = theme.useToken();
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  }); //draggable space
  const draggleRef = useRef<HTMLDivElement>(null);
  const handleDrag = (e: DraggableEvent, uiData: DraggableData) => {
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

  const [open, setOpen] = useControllableState(modalProps, {
    valuePropName: 'open',
    trigger: 'onCancel',
  });
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const activeElement = document.activeElement;
        if (
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.getAttribute('role') === 'combobox')
        ) {
          (activeElement as HTMLElement)?.blur?.();
        } else {
          setOpen(false);
        }
      }
    };

    if (open && keyboard) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen, keyboard]);

  return (
    <>
      <style>{rawBAIModalCss}</style>
      <Modal
        keyboard={false}
        {...modalProps}
        //override open with controlled open
        open={open}
        centered={modalProps.centered ?? true}
        className={`bai-modal ${className ?? ''}`}
        wrapClassName={modalProps.draggable ? 'draggable' : ''}
        styles={{
          ...styles,
          header: {
            marginBottom: 0,
            borderBottom: `1px solid var(--token-colorBorder, ${token.colorBorder})`,
            borderWidth: '100%',
            justifyContent: 'space-between',
            display: 'flex',
            alignItems: 'center',
            height: 'var(--general-modal-header-height, 69px)',
            padding: 'var(--general-modal-header-padding, 10px 24px)',
            ...styles?.header,
          },
          body: {
            padding: `var(--general-modal-body-padding, 0 24px)`,
            maxHeight: 'calc(100vh - 69px - 57px - 48px)',
            overflow: 'auto',
            paddingTop: token.paddingMD,
            paddingBottom: token.paddingMD,
            ...styles?.body,
          },
          content: {
            padding: `var(--general-modal-content-padding, 0)`,
            ...styles?.content,
          },
          footer: {
            borderTop: '1px solid',
            borderColor: token.colorBorder,
            padding: token.paddingSM,
            paddingLeft: token.paddingMD,
            paddingRight: token.paddingMD,
            marginTop: 0,
            ...styles?.footer,
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
              // @ts-expect-error
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
    </>
  );
};

export default BAIModal;
