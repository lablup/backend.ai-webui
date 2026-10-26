import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type EntityTarget = {
    entityId: string;
    entityType: string;
};
export type BAIEntityLabelTargetCellQuery$variables = {
    scope: ReadonlyArray<EntityTarget>;
};
export type BAIEntityLabelTargetCellQuery$data = {
    readonly entityLabels: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIEntityLabelSettingModalFragment" | "BAIEntityLabelTokensFragment">;
    } | null | undefined;
};
export type BAIEntityLabelTargetCellQuery = {
    response: BAIEntityLabelTargetCellQuery$data;
    variables: BAIEntityLabelTargetCellQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
