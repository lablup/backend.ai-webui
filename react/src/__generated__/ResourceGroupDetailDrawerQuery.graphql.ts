/**
 * @generated SignedSource<<fe75be3ef83a8780ecc06128663d8572>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourceGroupDetailDrawerQuery$variables = {
  name: string;
};
export type ResourceGroupDetailDrawerQuery$data = {
  readonly scaling_group: {
    readonly scheduler_opts: string | null | undefined;
  } | null | undefined;
};
export type ResourceGroupDetailDrawerQuery = {
  response: ResourceGroupDetailDrawerQuery$data;
  variables: ResourceGroupDetailDrawerQuery$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "ScalingGroup",
    "kind": "LinkedField",
    "name": "scaling_group",
    "plural": false,
    "selections": [
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupDetailDrawerQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupDetailDrawerQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e7e9fcc40ebb348fe8030b2cdcacb488",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupDetailDrawerQuery",
    "operationKind": "query",
    "text": "query ResourceGroupDetailDrawerQuery(\n  $name: String!\n) {\n  scaling_group(name: $name) {\n    scheduler_opts\n  }\n}\n"
  }
};
})();

(node as any).hash = "6690a0a583a5063d49049be818659bc7";

export default node;
