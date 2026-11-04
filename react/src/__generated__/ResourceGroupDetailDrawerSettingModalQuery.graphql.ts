/**
 * @generated SignedSource<<751abc0da19e392b337dd4d21e1fc613>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDetailDrawerSettingModalQuery$variables = {
  name: string;
};
export type ResourceGroupDetailDrawerSettingModalQuery$data = {
  readonly scaling_group: {
    readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupSettingModalFragment">;
  } | null | undefined;
};
export type ResourceGroupDetailDrawerSettingModalQuery = {
  response: ResourceGroupDetailDrawerSettingModalQuery$data;
  variables: ResourceGroupDetailDrawerSettingModalQuery$variables;
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
    "name": "ResourceGroupDetailDrawerSettingModalQuery",
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
    "name": "ResourceGroupDetailDrawerSettingModalQuery",
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
    "cacheID": "65225859ad66b2d9880c83db7b7476bc",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupDetailDrawerSettingModalQuery",
    "operationKind": "query",
    "text": "query ResourceGroupDetailDrawerSettingModalQuery(\n  $name: String!\n) {\n  scaling_group(name: $name) {\n    ...ResourceGroupSettingModalFragment\n  }\n}\n\nfragment ResourceGroupSettingModalFragment on ScalingGroup {\n  name\n  description\n  is_active\n  is_public\n  wsproxy_addr\n  scheduler\n  scheduler_opts\n}\n"
  }
};
})();

(node as any).hash = "1a4c1f869aac97ef3467015e5bf00372";

export default node;
