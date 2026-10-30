import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
import { LinkProps } from 'react-router-dom';
export interface BAILinkProps extends Omit<LinkProps, 'to'> {
    /**
     * Defaults to `'hover'`. A link that does not look and behave like a link is
     * a bug, so the accent colour + hover underline are the baseline rather than
     * something each call site has to remember to ask for — before QA3, the
     * ~10 `to`-only sites (artifact/model names, `FolderLink`, …) fell through to
     * a class-less react-router `<a>`, which Astryx's reset
     * (`:where(a){color:inherit;text-decoration:inherit}`) flattened into plain
     * body text. Pass `'disabled'` for the non-interactive state.
     */
    type?: 'hover' | 'disabled' | undefined;
    icon?: React.ReactNode;
    to?: LinkProps['to'];
    ellipsis?: boolean | {
        tooltip?: string;
    };
    children?: string | React.ReactNode;
}
declare const BAILink: React.FC<BAILinkProps>;
export default BAILink;
