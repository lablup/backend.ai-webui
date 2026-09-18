import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIDeploymentOwnerInfo_deployment$data = {
    readonly creator: {
        readonly basicInfo: {
            readonly email: string;
            readonly fullName: string | null | undefined;
            readonly username: string | null | undefined;
        };
        readonly id: string;
    } | null | undefined;
    readonly id: string;
    readonly " $fragmentType": "BAIDeploymentOwnerInfo_deployment";
};
export type BAIDeploymentOwnerInfo_deployment$key = {
    readonly " $data"?: BAIDeploymentOwnerInfo_deployment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentOwnerInfo_deployment">;
};
declare const node: ReaderFragment;
export default node;
