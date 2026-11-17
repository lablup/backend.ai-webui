/**
 * @generated SignedSource<<2e01d4ab76c558f4c75278b851e535ec>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupSettingModalTestQuery$variables = {
  name: string;
};
export type ResourceGroupSettingModalTestQuery$data = {
  readonly scaling_group: {
    readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupSettingModalFragment">;
  } | null | undefined;
};
export type ResourceGroupSettingModalTestQuery = {
  response: ResourceGroupSettingModalTestQuery$data;
  variables: ResourceGroupSettingModalTestQuery$variables;
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
    "name": "ResourceGroupSettingModalTestQuery",
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
            "name": "ResourceGroupSettingModalFragment"
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
    "name": "ResourceGroupSettingModalTestQuery",
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
            "name": "wsproxy_addr",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "bb062782868fa8c4b4f15f60317a3fd8",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSettingModalTestQuery",
    "operationKind": "query",
    "text": "query ResourceGroupSettingModalTestQuery(\n  $name: String!\n) {\n  scaling_group(name: $name) {\n    ...ResourceGroupSettingModalFragment\n  }\n}\n\nfragment ResourceGroupSettingModalFragment on ScalingGroup {\n  name\n  description\n  is_active\n  is_public\n  wsproxy_addr\n  scheduler\n  scheduler_opts\n}\n"
  }
};
})();

(node as any).hash = "e65a4a8e7ff41aa8a01c29bfbb5a4b2a";

export default node;
