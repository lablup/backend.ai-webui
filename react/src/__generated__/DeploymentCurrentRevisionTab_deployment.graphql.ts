/**
 * @generated SignedSource<<9de37920cfbb96ed03005384989c7412>>
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
v1 = [
  (v0/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "revisionNumber",
    "storageKey": null
  },
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "DeploymentRevisionDetail_revision"
  }
];
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
      "selections": (v1/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelRevision",
      "kind": "LinkedField",
      "name": "deployingRevision",
      "plural": false,
      "selections": (v1/*: any*/),
      "storageKey": null
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};
})();

(node as any).hash = "28e3397e8a94310a7797f095fa97f158";

export default node;
