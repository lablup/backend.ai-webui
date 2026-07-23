/**
 * @generated SignedSource<<8bcd1f9e58f4b773cda1d6fcad9d2722>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EduAppLauncherSessionQuery$variables = {
  id: any;
};
export type EduAppLauncherSessionQuery$data = {
  readonly compute_session_node: {
    readonly " $fragmentSpreads": FragmentRefs<"useBackendAIAppLauncherFragment">;
  } | null | undefined;
};
export type EduAppLauncherSessionQuery = {
  response: EduAppLauncherSessionQuery$data;
  variables: EduAppLauncherSessionQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EduAppLauncherSessionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useBackendAIAppLauncherFragment"
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
    "name": "EduAppLauncherSessionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "row_id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "vfolder_mounts",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "scaling_group",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "project_id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "service_ports",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "680a6c5ac0eb98543af7a03eaf17ad2f",
    "id": null,
    "metadata": {},
    "name": "EduAppLauncherSessionQuery",
    "operationKind": "query",
    "text": "query EduAppLauncherSessionQuery(\n  $id: GlobalIDField!\n) {\n  compute_session_node(id: $id) {\n    ...useBackendAIAppLauncherFragment\n    id\n  }\n}\n\nfragment useBackendAIAppLauncherFragment on ComputeSessionNode {\n  name\n  row_id\n  vfolder_mounts\n  scaling_group\n  project_id\n  service_ports\n}\n"
  }
};
})();

(node as any).hash = "ca2d3b3929f623028fe5c6b7a786658f";

export default node;
