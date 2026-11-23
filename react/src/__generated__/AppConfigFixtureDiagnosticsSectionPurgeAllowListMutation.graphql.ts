/**
 * @generated SignedSource<<f5082f7a111a63c9533089824df22435>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation$variables = {
  allowListIds: ReadonlyArray<string>;
};
export type AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation$data = {
  readonly partialBulkPurgeAppConfigAllowLists: {
    readonly failed: ReadonlyArray<{
      readonly id: string;
      readonly message: string;
    }>;
  };
};
export type AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation = {
  response: AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation$data;
  variables: AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "allowListIds"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "ids",
            "variableName": "allowListIds"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "PartialBulkAppConfigAllowListsPayload",
    "kind": "LinkedField",
    "name": "partialBulkPurgeAppConfigAllowLists",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "PartialBulkFailure",
        "kind": "LinkedField",
        "name": "failed",
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
            "name": "message",
            "storageKey": null
          }
        ],
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
    "name": "AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "939d6b97e45c8f9c8e108fd732abddd6",
    "id": null,
    "metadata": {},
    "name": "AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation",
    "operationKind": "mutation",
    "text": "mutation AppConfigFixtureDiagnosticsSectionPurgeAllowListMutation(\n  $allowListIds: [UUID!]!\n) {\n  partialBulkPurgeAppConfigAllowLists(input: {ids: $allowListIds}) {\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "df3837804669408e7e0db58ce62f9e5d";

export default node;
