/**
 * @generated SignedSource<<8dd6f3af668fa909456bedb7b01e30a8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourcePoliciesPanelQuery$variables = Record<PropertyKey, never>;
export type ResourcePoliciesPanelQuery$data = {
  readonly keypair: {
    readonly count: number;
  } | null | undefined;
  readonly project: {
    readonly count: number;
  } | null | undefined;
  readonly user: {
    readonly count: number;
  } | null | undefined;
};
export type ResourcePoliciesPanelQuery = {
  response: ResourcePoliciesPanelQuery$data;
  variables: ResourcePoliciesPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v2 = [
  {
    "alias": "keypair",
    "args": (v0/*: any*/),
    "concreteType": "KeypairResourcePolicyV2Connection",
    "kind": "LinkedField",
    "name": "adminKeypairResourcePoliciesV2",
    "plural": false,
    "selections": (v1/*: any*/),
    "storageKey": "adminKeypairResourcePoliciesV2(limit:1)"
  },
  {
    "alias": "user",
    "args": (v0/*: any*/),
    "concreteType": "UserResourcePolicyV2Connection",
    "kind": "LinkedField",
    "name": "adminUserResourcePoliciesV2",
    "plural": false,
    "selections": (v1/*: any*/),
    "storageKey": "adminUserResourcePoliciesV2(limit:1)"
  },
  {
    "alias": "project",
    "args": (v0/*: any*/),
    "concreteType": "ProjectResourcePolicyV2Connection",
    "kind": "LinkedField",
    "name": "adminProjectResourcePoliciesV2",
    "plural": false,
    "selections": (v1/*: any*/),
    "storageKey": "adminProjectResourcePoliciesV2(limit:1)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourcePoliciesPanelQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ResourcePoliciesPanelQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "9c5b5f745c02e90a2cfe9e57b8bd34eb",
    "id": null,
    "metadata": {},
    "name": "ResourcePoliciesPanelQuery",
    "operationKind": "query",
    "text": "query ResourcePoliciesPanelQuery {\n  keypair: adminKeypairResourcePoliciesV2(limit: 1) {\n    count\n  }\n  user: adminUserResourcePoliciesV2(limit: 1) {\n    count\n  }\n  project: adminProjectResourcePoliciesV2(limit: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "74f93c448a826a5186b8ffeffd24d437";

export default node;
