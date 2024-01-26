// @ts-ignore
import rawBAIModalCss from './BAIModal.css?raw';
import { Modal, ModalProps, theme } from 'antd';
import React, { useState, useRef } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';

export interface BAIModalProps extends ModalProps {
  okText?: string; // customize text of ok button with adequate content
  draggable?: boolean; // modal can be draggle
}
const BAIModal: React.FC<BAIModalProps> = ({ styles, ...modalProps }) => {
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
      left: uiData.x + (250 - targetRect.left), //250 is sidebar width
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };
  return (
    <>
      <style>{rawBAIModalCss}</style>
      <Modal
        {...modalProps}
        centered={modalProps.centered ?? true}
        className="bai-modal"
        styles={{
          ...styles,
          header: {
            marginBottom: token.marginSM,
            cursor: modalProps.draggable ? 'move' : '',
            ...styles?.header,
          },
        }}
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 69,
              paddingLeft: 20,
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
          >
            {modalProps.title}
          </div>
        }
        children={
          <div onMouseOver={() => setDisabled(true)}>{modalProps.children}</div>
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
      />
    </>
  );
};

export default BAIModal;
