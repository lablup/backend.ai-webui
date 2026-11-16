/** The entity type names the label UI is wired for. */
export type BAILabelableEntityType = 'session' | 'vfolder' | 'deployment' | 'resource_group';
/**
 * The entity types the manager accepts labels for, fetched once per page load and
 * kept for the session. Empty until the first response arrives.
 */
export declare const useLabelableEntityTypes: () => ReadonlySet<string>;
export declare const useIsLabelableEntityType: (entityType: BAILabelableEntityType) => boolean;
export default useLabelableEntityTypes;
