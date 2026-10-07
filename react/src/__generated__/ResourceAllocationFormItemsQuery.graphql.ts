/**
 * @generated SignedSource<<d51b288a546556df57b14492ac734499>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceAllocationFormItemsQuery$variables = {
  projectID: string;
};
export type ResourceAllocationFormItemsQuery$data = {
  readonly accessible_scaling_groups: ReadonlyArray<{
    readonly accelerator_quantum_size: number | null | undefined;
    readonly is_active: boolean | null | undefined;
    readonly name: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"useResourceLimitAndRemainingFragment">;
  } | null | undefined> | null | undefined;
  readonly resource_presets: ReadonlyArray<{
    readonly id: string | null | undefined;
    readonly name: string | null | undefined;
    readonly scaling_group_name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type ResourceAllocationFormItemsQuery = {
  response: ResourceAllocationFormItemsQuery$data;
  variables: ResourceAllocationFormItemsQuery$variables;
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
  "name": "accelerator_quantum_size",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_active",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourcePreset",
  "kind": "LinkedField",
  "name": "resource_presets",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    (v3/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scaling_group_name",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceAllocationFormItemsQuery",
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
          (v4/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useResourceLimitAndRemainingFragment"
          }
        ],
        "storageKey": null
      },
      (v5/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceAllocationFormItemsQuery",
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
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "resource_allocation_limit_for_sessions",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v5/*: any*/)
    ]
  },
  "params": {
    "cacheID": "3d9e15dc3855f4e31863da38f800decf",
    "id": null,
    "metadata": {},
    "name": "ResourceAllocationFormItemsQuery",
    "operationKind": "query",
    "text": "query ResourceAllocationFormItemsQuery(\n  $projectID: UUID!\n) {\n  accessible_scaling_groups(project_id: $projectID) {\n    accelerator_quantum_size\n    name\n    is_active\n    ...useResourceLimitAndRemainingFragment\n  }\n  resource_presets {\n    id\n    name\n    scaling_group_name\n  }\n}\n\nfragment useResourceLimitAndRemainingFragment on ScalingGroup {\n  name\n  resource_allocation_limit_for_sessions\n}\n"
  }
};
})();

(node as any).hash = "d8461d367b6a656ca490e54cc5223c32";

export default node;
