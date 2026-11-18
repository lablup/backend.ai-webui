/**
 * @generated SignedSource<<8282d11a9a3b247f4ed0064170f41848>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppConfigFixtureDiagnosticsSectionPurgeMutation$variables = {
  allowListIds: ReadonlyArray<string>;
  definitionIds: ReadonlyArray<string>;
};
export type AppConfigFixtureDiagnosticsSectionPurgeMutation$data = {
  readonly partialBulkPurgeAppConfigAllowLists: {
    readonly failed: ReadonlyArray<{
      readonly id: string;
      readonly message: string;
    }>;
  };
  readonly partialBulkPurgeAppConfigDefinitions: {
    readonly failed: ReadonlyArray<{
      readonly id: string;
      readonly message: string;
    }>;
  };
};
export type AppConfigFixtureDiagnosticsSectionPurgeMutation = {
  response: AppConfigFixtureDiagnosticsSectionPurgeMutation$data;
  variables: AppConfigFixtureDiagnosticsSectionPurgeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "allowListIds"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "definitionIds"
  }
],
v1 = [
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
v2 = [
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
    "selections": (v1/*: any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "ids",
            "variableName": "definitionIds"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "PartialBulkAppConfigDefinitionsPayload",
    "kind": "LinkedField",
    "name": "partialBulkPurgeAppConfigDefinitions",
    "plural": false,
    "selections": (v1/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AppConfigFixtureDiagnosticsSectionPurgeMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AppConfigFixtureDiagnosticsSectionPurgeMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "6d06d15584d446dfd2cb0ce1f4ce78f8",
    "id": null,
    "metadata": {},
    "name": "AppConfigFixtureDiagnosticsSectionPurgeMutation",
    "operationKind": "mutation",
    "text": "mutation AppConfigFixtureDiagnosticsSectionPurgeMutation(\n  $allowListIds: [UUID!]!\n  $definitionIds: [UUID!]!\n) {\n  partialBulkPurgeAppConfigAllowLists(input: {ids: $allowListIds}) {\n    failed {\n      id\n      message\n    }\n  }\n  partialBulkPurgeAppConfigDefinitions(input: {ids: $definitionIds}) {\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8cc36e4c2779c0061dc2626b73b15937";

export default node;
