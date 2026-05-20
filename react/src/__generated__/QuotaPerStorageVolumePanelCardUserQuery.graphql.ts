/**
 * @generated SignedSource<<ea4df702aee7d8488f9b7d968c2b9c3b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type QuotaPerStorageVolumePanelCardUserQuery$variables = {
  domain_name?: string | null | undefined;
  email?: string | null | undefined;
};
export type QuotaPerStorageVolumePanelCardUserQuery$data = {
  readonly user: {
    readonly id: string | null | undefined;
  } | null | undefined;
};
export type QuotaPerStorageVolumePanelCardUserQuery = {
  response: QuotaPerStorageVolumePanelCardUserQuery$data;
  variables: QuotaPerStorageVolumePanelCardUserQuery$variables;
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
    "name": "email"
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
        "kind": "Variable",
        "name": "email",
        "variableName": "email"
      }
    ],
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
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
    "name": "QuotaPerStorageVolumePanelCardUserQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "QuotaPerStorageVolumePanelCardUserQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0ad80eec6d619d2a7ba016c855727d62",
    "id": null,
    "metadata": {},
    "name": "QuotaPerStorageVolumePanelCardUserQuery",
    "operationKind": "query",
    "text": "query QuotaPerStorageVolumePanelCardUserQuery(\n  $domain_name: String\n  $email: String\n) {\n  user(domain_name: $domain_name, email: $email) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "02f38803567dbc61f570ce247fde2947";

export default node;
