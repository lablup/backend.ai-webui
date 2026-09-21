import { BAIDeploymentTagChips_metadata$key } from '../../__generated__/BAIDeploymentTagChips_metadata.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIDeploymentTagChipsProps {
    metadataFrgmt: BAIDeploymentTagChips_metadata$key | null | undefined;
    /**
     * Called when a chip is activated (mouse click or keyboard Enter/Space).
     * When provided, chips render as interactive buttons. When omitted, chips
     * are presented as plain (non-interactive) tags.
     */
    onTagClick?: (tag: string) => void;
    /**
     * When true, click and Enter/Space keypress events stop bubbling so the
     * surrounding row click handler does not also fire (used inside table
     * row contexts).
     */
    stopRowClick?: boolean;
    /** Rendered when there are no tags to display. */
    fallback?: React.ReactNode;
}
/**
 * Render a deployment metadata's tags as chips. When `onTagClick` is provided
 * the chips become interactive and forward the activated tag value to the
 * caller (typical use: navigate to a list filtered by that tag). Tag entries
 * are split on commas so legacy comma-joined values render as individual
 * chips.
 */
declare const BAIDeploymentTagChips: React.FC<BAIDeploymentTagChipsProps>;
export default BAIDeploymentTagChips;
