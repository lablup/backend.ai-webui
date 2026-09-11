import { BAIImageTagFact } from './BAIImageTagBadges';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type BAIImageMetaRowVariant = 'full' | 'compact' | 'path';
export interface BAIImageMetaRowProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
    /**
     * `registry/namespace:tag@architecture`. Drives the icon, the copy value and
     * every part the caller does not override.
     */
    fullName: string | null | undefined;
    /**
     * `full` shows the tag chips, `compact` drops them, `path` shows the raw
     * reference as monospace text instead of the decomposed row.
     */
    variant?: BAIImageMetaRowVariant;
    /** Aliased base image name; defaults to the one derived from `fullName`. */
    name?: string | null;
    /** Base version; defaults to the one derived from `fullName`. */
    version?: string | null;
    /** Architecture; defaults to the one derived from `fullName`. */
    architecture?: string | null;
    /** Tag chips for the `full` variant. */
    tags?: Array<BAIImageTagFact>;
    copyable?: boolean;
    /** Tooltip on the copy control; defaults to BUI's generic "Copy". */
    copyLabel?: string;
    highlightKeyword?: string;
}
/**
 * The one way this project shows a container image (ADR 0004): the meta icon,
 * the aliased base name, the base version and the architecture, separated by
 * {@link BAIImageMetaDivider}, followed by the tag chips and a copy control
 * for the full reference.
 *
 * It reads plain strings rather than a Relay fragment, so the v1 `ImageNode`
 * surfaces, the v2 `ImageV2` surfaces and the session launcher's form values
 * all render through it. Icon and aliasing come from `useBAIImageMetaData`, so
 * it must sit under `BAIMetaDataProvider`.
 */
declare const BAIImageMetaRow: React.FC<BAIImageMetaRowProps>;
export default BAIImageMetaRow;
