/**
 * @generated SignedSource<<64eaa09b84d092a72e03a0eb8e9d662e>>
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
    "cacheID": "9a9f3a19c796bbf49aab559a24caff8d",
    "id": null,
    "metadata": {},
    "name": "ResourceAllocationFormItemsQuery",
    "operationKind": "query",
    "text": "query ResourceAllocationFormItemsQuery(\n  $projectID: UUID!\n) {\n  accessible_scaling_groups(project_id: $projectID) {\n    accelerator_quantum_size\n    name\n    is_active\n    ...useResourceLimitAndRemainingFragment\n  }\n  resource_presets {\n    id\n    scaling_group_name @since(version: \"25.4.0\")\n  }\n}\n\nfragment useResourceLimitAndRemainingFragment on ScalingGroup {\n  name\n  resource_allocation_limit_for_sessions @since(version: \"25.6.0\")\n}\n"
  }
};
})();

(node as any).hash = "9187ad312010d16b9c62530b610847cd";

export default node;
