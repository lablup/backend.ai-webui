/**
 * @generated SignedSource<<99529af65495bc4ca6d2c222ad3dd3f3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkCreateUserFromCSVModalGroupsQuery$variables = {
  domain_name?: string | null | undefined;
  type?: ReadonlyArray<string | null | undefined> | null | undefined;
};
export type BulkCreateUserFromCSVModalGroupsQuery$data = {
  readonly groups: ReadonlyArray<{
    readonly id: string | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type BulkCreateUserFromCSVModalGroupsQuery = {
  response: BulkCreateUserFromCSVModalGroupsQuery$data;
  variables: BulkCreateUserFromCSVModalGroupsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domain_name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "type"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "domain_name",
        "variableName": "domain_name"
      },
      {
        "kind": "Literal",
        "name": "is_active",
        "value": true
      },
      {
        "kind": "Variable",
        "name": "type",
        "variableName": "type"
      }
    ],
    "concreteType": "Group",
    "kind": "LinkedField",
    "name": "groups",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
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
    "name": "BulkCreateUserFromCSVModalGroupsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BulkCreateUserFromCSVModalGroupsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "907bf63fe3ef62524aab93b5b541bafb",
    "id": null,
    "metadata": {},
    "name": "BulkCreateUserFromCSVModalGroupsQuery",
    "operationKind": "query",
    "text": "query BulkCreateUserFromCSVModalGroupsQuery(\n  $domain_name: String\n  $type: [String]\n) {\n  groups(domain_name: $domain_name, is_active: true, type: $type) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "4a592cfc93416494db8742d2df955f51";

export default node;
