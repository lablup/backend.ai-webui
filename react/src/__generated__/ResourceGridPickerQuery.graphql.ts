/**
 * @generated SignedSource<<0e94bb16f79a0f9dab50f4d11ffec694>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourceGridPickerQuery$variables = {
  filter?: string | null | undefined;
  groupID?: string | null | undefined;
  projectID: string;
};
export type ResourceGridPickerQuery$data = {
  readonly accessible_scaling_groups: ReadonlyArray<{
    readonly accelerator_quantum_size: number | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly compute_session_list: {
    readonly items: ReadonlyArray<{
      readonly id: string | null | undefined;
      readonly name: string | null | undefined;
      readonly occupied_slots: string | null | undefined;
      readonly requested_slots: string | null | undefined;
      readonly status: string | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type ResourceGridPickerQuery = {
  response: ResourceGridPickerQuery$data;
  variables: ResourceGridPickerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "groupID"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectID"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "project_id",
        "variableName": "projectID"
      }
    ],
    "concreteType": "ScalingGroup",
    "kind": "LinkedField",
    "name": "accessible_scaling_groups",
    "plural": true,
    "selections": [
      (v3/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accelerator_quantum_size",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "filter"
      },
      {
        "kind": "Variable",
        "name": "group_id",
        "variableName": "groupID"
      },
      {
        "kind": "Literal",
        "name": "limit",
        "value": 100
      },
      {
        "kind": "Literal",
        "name": "offset",
        "value": 0
      }
    ],
    "concreteType": "ComputeSessionList",
    "kind": "LinkedField",
    "name": "compute_session_list",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ComputeSession",
        "kind": "LinkedField",
        "name": "items",
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
            "name": "status",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "occupied_slots",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "requested_slots",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGridPickerQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ResourceGridPickerQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "37c2e3f6076238501582fb65fb0de491",
    "id": null,
    "metadata": {},
    "name": "ResourceGridPickerQuery",
    "operationKind": "query",
    "text": "query ResourceGridPickerQuery(\n  $projectID: UUID!\n  $groupID: String\n  $filter: String\n) {\n  accessible_scaling_groups(project_id: $projectID) {\n    name\n    accelerator_quantum_size\n  }\n  compute_session_list(limit: 100, offset: 0, filter: $filter, group_id: $groupID) {\n    items {\n      id\n      name\n      status\n      occupied_slots\n      requested_slots\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0c1c513769639c14f01663779094f1bc";

export default node;
