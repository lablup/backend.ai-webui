import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
