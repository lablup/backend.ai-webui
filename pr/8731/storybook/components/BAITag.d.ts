import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAITagProps {
    /** antd `Tag` colour: status preset, palette preset, or a runtime string. */
    color?: string;
    icon?: React.ReactNode;
    closable?: boolean;
    onClose?: (e: React.MouseEvent<HTMLElement>) => void;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    /** antd v6 `variant` (`filled` | `outlined` | `solid`) — see PILOT-DECISION. */
    variant?: string;
    'data-testid'?: string;
}
declare const BAITag: React.FC<BAITagProps>;
export default BAITag;
