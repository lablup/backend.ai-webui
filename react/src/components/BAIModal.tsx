// @ts-ignore
import rawBAIModalCss from './BAIModal.css?raw';
import Flex from './Flex';
import { HolderOutlined } from '@ant-design/icons';
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
  return (
    <>
      <style>{rawBAIModalCss}</style>
      <Modal
        {...modalProps}
        centered={modalProps.centered ?? true}
        className="bai-modal"
        wrapClassName={modalProps.draggable ? 'draggable' : ''}
        styles={{
          ...styles,
          header: {
            marginBottom: token.marginSM,
            ...styles?.header,
          },
        }}
        title={
          <Flex gap={'xs'}>
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
          </Flex>
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
        zIndex={1001}
      />
    </>
  );
};

export default BAIModal;
