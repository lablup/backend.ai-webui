/**
 * @generated SignedSource<<18c58d318fe48744750a3ac5e7dbff0e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupListSettingModalQuery$variables = {
  name: string;
};
export type ResourceGroupListSettingModalQuery$data = {
  readonly scaling_group: {
    readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupSettingModalFragment">;
  } | null | undefined;
};
export type ResourceGroupListSettingModalQuery = {
  response: ResourceGroupListSettingModalQuery$data;
  variables: ResourceGroupListSettingModalQuery$variables;
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
    "name": "ResourceGroupListSettingModalQuery",
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
    "name": "ResourceGroupListSettingModalQuery",
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
            "name": "wsproxy_api_token",
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
    "cacheID": "9d86bd6fbf44a13961ec8e015c8db3d7",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupListSettingModalQuery",
    "operationKind": "query",
    "text": "query ResourceGroupListSettingModalQuery(\n  $name: String!\n) {\n  scaling_group(name: $name) {\n    ...ResourceGroupSettingModalFragment\n  }\n}\n\nfragment ResourceGroupSettingModalFragment on ScalingGroup {\n  name\n  description\n  is_active\n  is_public\n  wsproxy_addr\n  wsproxy_api_token\n  scheduler\n  scheduler_opts\n}\n"
  }
};
})();

(node as any).hash = "c394da4a4b0d865472329be6283b6895";

export default node;
