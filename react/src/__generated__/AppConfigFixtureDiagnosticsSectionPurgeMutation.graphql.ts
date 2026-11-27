/**
 * @generated SignedSource<<9564fbe2188a50ff9355efa9a1adb0f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppConfigFixtureDiagnosticsSectionPurgeMutation$variables = {
  definitionIds: ReadonlyArray<string>;
};
export type AppConfigFixtureDiagnosticsSectionPurgeMutation$data = {
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
    "name": "definitionIds"
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
    "name": "AppConfigFixtureDiagnosticsSectionPurgeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AppConfigFixtureDiagnosticsSectionPurgeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "380fa76a2cf3b730dab87f32b6ccc0d1",
    "id": null,
    "metadata": {},
    "name": "AppConfigFixtureDiagnosticsSectionPurgeMutation",
    "operationKind": "mutation",
    "text": "mutation AppConfigFixtureDiagnosticsSectionPurgeMutation(\n  $definitionIds: [UUID!]!\n) {\n  partialBulkPurgeAppConfigDefinitions(input: {ids: $definitionIds}) {\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3504eb48c0db99fbbbd471482deabf8c";

export default node;
