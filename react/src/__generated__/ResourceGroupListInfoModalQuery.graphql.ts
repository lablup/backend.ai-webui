/**
 * @generated SignedSource<<b0deb0c6a20cea8944b82aac11013e83>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupListInfoModalQuery$variables = {
  name: string;
};
export type ResourceGroupListInfoModalQuery$data = {
  readonly scaling_group: {
    readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupInfoModalFragment">;
  } | null | undefined;
};
export type ResourceGroupListInfoModalQuery = {
  response: ResourceGroupListInfoModalQuery$data;
  variables: ResourceGroupListInfoModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupListInfoModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ScalingGroup",
        "kind": "LinkedField",
        "name": "scaling_group",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ResourceGroupInfoModalFragment"
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
    "name": "ResourceGroupListInfoModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ScalingGroup",
        "kind": "LinkedField",
        "name": "scaling_group",
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
            "name": "description",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "is_active",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "is_public",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "driver",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "driver_opts",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "scheduler",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "scheduler_opts",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "wsproxy_addr",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0bb2250b4a30dc04bd90f102ea2d67e5",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupListInfoModalQuery",
    "operationKind": "query",
    "text": "query ResourceGroupListInfoModalQuery(\n  $name: String!\n) {\n  scaling_group(name: $name) {\n    ...ResourceGroupInfoModalFragment\n  }\n}\n\nfragment ResourceGroupInfoModalFragment on ScalingGroup {\n  name\n  description\n  is_active\n  is_public\n  driver\n  driver_opts\n  scheduler\n  scheduler_opts\n  wsproxy_addr\n}\n"
  }
};
})();

(node as any).hash = "b95ed7e2b1e714c07ab25d2e4e8393f7";

export default node;
