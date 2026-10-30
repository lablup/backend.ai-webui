/**
 * @generated SignedSource<<192ba8a4ac67012fa1c9ea7d31c19ced>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type QuickSessionResourceCardsQuery$variables = {
  projectID: string;
};
export type QuickSessionResourceCardsQuery$data = {
  readonly accessible_scaling_groups: ReadonlyArray<{
    readonly accelerator_quantum_size: number | null | undefined;
    readonly name: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"useResourceLimitAndRemainingFragment">;
  } | null | undefined> | null | undefined;
};
export type QuickSessionResourceCardsQuery = {
  response: QuickSessionResourceCardsQuery$data;
  variables: QuickSessionResourceCardsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectID"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "project_id",
    "variableName": "projectID"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "accelerator_quantum_size",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "QuickSessionResourceCardsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ScalingGroup",
        "kind": "LinkedField",
        "name": "accessible_scaling_groups",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useResourceLimitAndRemainingFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "QuickSessionResourceCardsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ScalingGroup",
        "kind": "LinkedField",
        "name": "accessible_scaling_groups",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "resource_allocation_limit_for_sessions",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f21dccd71933550a6819ed21edc2b502",
    "id": null,
    "metadata": {},
    "name": "QuickSessionResourceCardsQuery",
    "operationKind": "query",
    "text": "query QuickSessionResourceCardsQuery(\n  $projectID: UUID!\n) {\n  accessible_scaling_groups(project_id: $projectID) {\n    name\n    accelerator_quantum_size\n    ...useResourceLimitAndRemainingFragment\n  }\n}\n\nfragment useResourceLimitAndRemainingFragment on ScalingGroup {\n  name\n  resource_allocation_limit_for_sessions\n}\n"
  }
};
})();

(node as any).hash = "68ebfa581d76135a23dfa8ecbaf8438a";

export default node;
