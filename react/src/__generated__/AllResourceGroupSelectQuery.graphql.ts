/**
 * @generated SignedSource<<05dc61cf169e78b5b9b3e585939f60ea>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AllResourceGroupSelectQuery$variables = {
  is_active?: boolean | null | undefined;
};
export type AllResourceGroupSelectQuery$data = {
  readonly scaling_groups: ReadonlyArray<{
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type AllResourceGroupSelectQuery = {
  response: AllResourceGroupSelectQuery$data;
  variables: AllResourceGroupSelectQuery$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "is_active",
        "variableName": "is_active"
      }
    ],
    "concreteType": "ScalingGroup",
    "kind": "LinkedField",
    "name": "scaling_groups",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
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
    "name": "AllResourceGroupSelectQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AllResourceGroupSelectQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f1f34aa5198cc43c3671ce108e982dd4",
    "id": null,
    "metadata": {},
    "name": "AllResourceGroupSelectQuery",
    "operationKind": "query",
    "text": "query AllResourceGroupSelectQuery(\n  $is_active: Boolean\n) {\n  scaling_groups(is_active: $is_active) {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "90a047242127cdcbb1a738a936d8ef90";

export default node;
