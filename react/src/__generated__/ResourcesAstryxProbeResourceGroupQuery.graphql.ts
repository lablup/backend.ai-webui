/**
 * @generated SignedSource<<4c0e088cb6bd468e33bb476c01d7501d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourcesAstryxProbeResourceGroupQuery$variables = {
  is_active?: boolean | null | undefined;
};
export type ResourcesAstryxProbeResourceGroupQuery$data = {
  readonly scaling_groups: ReadonlyArray<{
    readonly name: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupInfoModalFragment">;
  } | null | undefined> | null | undefined;
};
export type ResourcesAstryxProbeResourceGroupQuery = {
  response: ResourcesAstryxProbeResourceGroupQuery$data;
  variables: ResourcesAstryxProbeResourceGroupQuery$variables;
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourcesAstryxProbeResourceGroupQuery",
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
    "name": "ResourcesAstryxProbeResourceGroupQuery",
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
    "cacheID": "0acdce59bb7a29f1098b763e57c6e4d7",
    "id": null,
    "metadata": {},
    "name": "ResourcesAstryxProbeResourceGroupQuery",
    "operationKind": "query",
    "text": "query ResourcesAstryxProbeResourceGroupQuery(\n  $is_active: Boolean\n) {\n  scaling_groups(is_active: $is_active) {\n    name\n    ...ResourceGroupInfoModalFragment\n  }\n}\n\nfragment ResourceGroupInfoModalFragment on ScalingGroup {\n  name\n  description\n  is_active\n  is_public\n  driver\n  driver_opts\n  scheduler\n  scheduler_opts\n  wsproxy_addr\n}\n"
  }
};
})();

(node as any).hash = "16cd5f494092129a4b5089ae39575400";

export default node;
