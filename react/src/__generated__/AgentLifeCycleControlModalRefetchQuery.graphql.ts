/**
 * @generated SignedSource<<a0a09e582b7cb8449a54043993bf7e47>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentLifeCycleControlModalRefetchQuery$variables = {
  id: string;
};
export type AgentLifeCycleControlModalRefetchQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"AgentLifeCycleControlModalFragment">;
  } | null | undefined;
};
export type AgentLifeCycleControlModalRefetchQuery = {
  response: AgentLifeCycleControlModalRefetchQuery$data;
  variables: AgentLifeCycleControlModalRefetchQuery$variables;
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
    "name": "AgentLifeCycleControlModalRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "AgentLifeCycleControlModalFragment"
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
    "name": "AgentLifeCycleControlModalRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
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
                "name": "status_changed",
                "storageKey": null
              }
            ],
            "type": "AgentNode",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a4136cc2ccf00b394f52adec7530dbd1",
    "id": null,
    "metadata": {},
    "name": "AgentLifeCycleControlModalRefetchQuery",
    "operationKind": "query",
    "text": "query AgentLifeCycleControlModalRefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...AgentLifeCycleControlModalFragment\n    id\n  }\n}\n\nfragment AgentLifeCycleControlModalFragment on AgentNode {\n  id\n  status\n  status_changed\n}\n"
  }
};
})();

(node as any).hash = "99c5cc9e353444a7bb4d222088b2c063";

export default node;
