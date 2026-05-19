/**
 * @generated SignedSource<<5ba62f0bc2feb8329ca7986a027996a7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupListQuery$variables = {
  is_active?: boolean | null | undefined;
};
export type ResourceGroupListQuery$data = {
  readonly scaling_groups: ReadonlyArray<{
    readonly description: string | null | undefined;
    readonly driver: string | null | undefined;
    readonly is_active: boolean | null | undefined;
    readonly is_public: boolean | null | undefined;
    readonly name: string | null | undefined;
    readonly scheduler: string | null | undefined;
    readonly wsproxy_addr: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupInfoModalFragment" | "ResourceGroupSettingModalFragment">;
  } | null | undefined> | null | undefined;
};
export type ResourceGroupListQuery = {
  response: ResourceGroupListQuery$data;
  variables: ResourceGroupListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "is_active"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "is_active",
    "variableName": "is_active"
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
  "name": "description",
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
  "kind": "ScalarField",
  "name": "is_public",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "driver",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scheduler",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "wsproxy_addr",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ScalingGroup",
        "kind": "LinkedField",
        "name": "scaling_groups",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ResourceGroupInfoModalFragment"
          },
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
    "name": "ResourceGroupListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ScalingGroup",
        "kind": "LinkedField",
        "name": "scaling_groups",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
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
            "name": "scheduler_opts",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "wsproxy_api_token",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4f827b0e615ed9ed75e172a457fa86b2",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupListQuery",
    "operationKind": "query",
    "text": "query ResourceGroupListQuery(\n  $is_active: Boolean\n) {\n  scaling_groups(is_active: $is_active) {\n    name\n    description\n    is_active\n    is_public\n    driver\n    scheduler\n    wsproxy_addr\n    ...ResourceGroupInfoModalFragment\n    ...ResourceGroupSettingModalFragment\n  }\n}\n\nfragment ResourceGroupInfoModalFragment on ScalingGroup {\n  name\n  description\n  is_active\n  is_public\n  driver\n  driver_opts\n  scheduler\n  scheduler_opts\n  wsproxy_addr\n}\n\nfragment ResourceGroupSettingModalFragment on ScalingGroup {\n  name\n  description\n  is_active\n  is_public\n  wsproxy_addr\n  wsproxy_api_token\n  scheduler\n  scheduler_opts\n}\n"
  }
};
})();

(node as any).hash = "73ad50968ae420ea2cd912e9fa046cf8";

export default node;
