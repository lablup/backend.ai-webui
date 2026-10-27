/**
 * @generated SignedSource<<2a074bf455756d394584b499d4c6a83d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentCurrentRevisionTab_deployment$data = {
  readonly currentRevision: {
    readonly id: string;
    readonly revisionNumber: number;
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
  } | null | undefined;
  readonly deployingRevision: {
    readonly fieldId: string;
    readonly id: string;
    readonly revisionNumber: number;
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "DeploymentCurrentRevisionTab_deployment";
};
export type DeploymentCurrentRevisionTab_deployment$key = {
  readonly " $data"?: DeploymentCurrentRevisionTab_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentCurrentRevisionTab_deployment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "revisionNumber",
  "storageKey": null
},
v2 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "DeploymentRevisionDetail_revision"
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentCurrentRevisionTab_deployment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelRevision",
      "kind": "LinkedField",
      "name": "currentRevision",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        (v2/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelRevision",
      "kind": "LinkedField",
      "name": "deployingRevision",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "fieldId",
          "storageKey": null
        },
        (v1/*: any*/),
        (v2/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};
})();

(node as any).hash = "37a6ee89b0e7af9134182752c0ba9fc3";

export default node;
