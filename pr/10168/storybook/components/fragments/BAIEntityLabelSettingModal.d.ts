import { BAIEntityLabelSettingModalFragment$key } from '../../__generated__/BAIEntityLabelSettingModalFragment.graphql';
import { BAILabelableEntityType } from '../../hooks/useLabelableEntityTypes';
import { BAIModalProps } from '../BAIModal';
export interface BAIEntityLabelSettingModalTarget {
    /** The entity's UUID, not its Relay global id. */
    entityId: string;
    /** Shown in the failure list; falls back to `entityId`. */
    name?: string;
}
export interface BAIEntityLabelSettingModalProps extends Omit<BAIModalProps, 'onOk' | 'onCancel' | 'title' | 'children'> {
    entityType: BAILabelableEntityType;
    targets: ReadonlyArray<BAIEntityLabelSettingModalTarget>;
    /** `edit` replaces one target's labels; `add` puts labels on every target. */
    mode?: 'edit' | 'add';
    /** The labels the target carries now, for `edit`. */
    entityLabelsFrgmt?: BAIEntityLabelSettingModalFragment$key | null;
    /** `success` is true when any label may have changed. */
    onRequestClose: (success: boolean) => void;
}
export type EntityLabelChange = {
    target: BAIEntityLabelSettingModalTarget;
    key: string;
    value: string;
} & ({
    kind: 'upsert';
} | {
    kind: 'purge';
    labelId: string;
});
/**
 * The requests a save sends. `edit` skips unchanged keys and purges removed ones;
 * `add` upserts every row on every target and purges nothing.
 */
export declare const planEntityLabelChanges: ({ mode, targets, currentLabels, rows, }: {
    mode: "edit" | "add";
    targets: ReadonlyArray<BAIEntityLabelSettingModalTarget>;
    currentLabels: ReadonlyArray<{
        fieldId: string;
        key: string;
        value: string;
    }>;
    rows: ReadonlyArray<{
        key: string;
        value: string;
    }>;
}) => EntityLabelChange[];
declare const BAIEntityLabelSettingModal: (props: BAIEntityLabelSettingModalProps) => import("react").JSX.Element;
export default BAIEntityLabelSettingModal;
