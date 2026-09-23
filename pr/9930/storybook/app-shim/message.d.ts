import { ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type MessageKind = 'success' | 'info' | 'warning' | 'error';
export interface MessageArgsProps {
    content: ReactNode;
    /** Auto-dismiss delay in seconds; `0` keeps the toast until dismissed. */
    duration?: number;
    onClose?: () => void;
    /** antd keyed-replace; mapped to Astryx `uniqueID` + 'overwrite'. */
    key?: string | number;
    /**
     * PILOT-DECISION: antd's custom `icon` override has no Astryx destination
     * (Toast has no leading-icon slot; severity is background color). Accepted
     * and ignored so object-form call sites keep compiling.
     */
    icon?: ReactNode;
}
export type JointContent = ReactNode | MessageArgsProps;
/** antd's MessageType: a close function that is also thenable. */
export interface MessageType extends PromiseLike<boolean> {
    (): void;
}
export interface MessageOpenArgs extends MessageArgsProps {
    type: MessageKind;
}
export declare const message: {
    success: (content: JointContent, duration?: number, onClose?: () => void) => MessageType;
    info: (content: JointContent, duration?: number, onClose?: () => void) => MessageType;
    warning: (content: JointContent, duration?: number, onClose?: () => void) => MessageType;
    error: (content: JointContent, duration?: number, onClose?: () => void) => MessageType;
    /** Covers the `message.open({ type, content })` shape (answers/07 §1.3). */
    open: ({ type, ...args }: MessageOpenArgs) => MessageType;
    /**
     * Known gap, kept loud: `message.loading` has 0 call sites in this repo
     * (answers/07 §1) and Astryx Toast has no loading concept. A future call
     * site should fail fast here, not silently drop feedback.
     */
    loading: () => MessageType;
    /** Known gap, kept loud: keyed `message.destroy` has 0 call sites. */
    destroy: () => void;
};
export type MessageApi = typeof message;
