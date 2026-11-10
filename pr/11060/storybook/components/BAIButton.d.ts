import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** antd `Button` `type`, kept verbatim for the call sites. */
export type BAIButtonType = 'primary' | 'default' | 'text' | 'link' | 'dashed';
/** antd `SizeType`, kept verbatim for the call sites. */
export type BAIButtonSize = 'small' | 'middle' | 'large';
export interface BAIButtonProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'title' | 'color' | 'children'> {
    /**
     * antd rendered this as the native `title` tooltip; Astryx has a real
     * `tooltip` prop, which is where it now goes.
     */
    title?: string;
    /** antd emphasis axis. See the PILOT-DECISIONs above for the mapping. */
    type?: BAIButtonType;
    size?: BAIButtonSize;
    icon?: ReactNode;
    loading?: boolean;
    disabled?: boolean;
    danger?: boolean;
    /** antd full-width button. */
    block?: boolean;
    /**
     * antd v6's emphasis axis (`filled | outlined | solid | dashed | text |
     * link`). One live call site (`VFolderSelect`) uses `variant="text"`; it is
     * folded into the same variant resolution as `type`.
     */
    variant?: 'filled' | 'outlined' | 'solid' | 'dashed' | 'text' | 'link';
    /**
     * antd v6's colour axis (`default | primary | danger | blue | purple | …`),
     * which pairs with `variant`. Astryx `Button` has a closed 4-value `variant`
     * enum and no colour slot (P5), so only `danger` carries meaning here — it
     * is folded into the same resolution as the `danger` boolean; everything
     * else is accepted and ignored rather than silently mapped to a hue Astryx
     * does not have. Two live call sites pass `color="default"`.
     */
    color?: string;
    /**
     * Async click handler. Renders a spinner while the returned promise is
     * pending and ignores re-clicks until it settles.
     */
    action?: () => Promise<void>;
    children?: ReactNode;
    /** `data-testid` and friends — Astryx spreads them onto the root element. */
    [key: `data-${string}`]: string | undefined;
}
declare const BAIButton: React.FC<BAIButtonProps>;
export default BAIButton;
