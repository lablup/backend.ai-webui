/**
 * @generated SignedSource<<c76c261e573e265ffe9ab4d3af731930>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateAppConfigAllowListInput = {
  id: string;
  rank?: number | null | undefined;
};
export type AppConfigFixtureDiagnosticsSectionRankMutation$variables = {
  items: ReadonlyArray<UpdateAppConfigAllowListInput>;
};
export type AppConfigFixtureDiagnosticsSectionRankMutation$data = {
  readonly partialBulkUpdateAppConfigAllowLists: {
    readonly failed: ReadonlyArray<{
      readonly id: string;
      readonly message: string;
    }>;
  };
};
export type AppConfigFixtureDiagnosticsSectionRankMutation = {
  response: AppConfigFixtureDiagnosticsSectionRankMutation$data;
  variables: AppConfigFixtureDiagnosticsSectionRankMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "items"
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
            "name": "items",
            "variableName": "items"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "PartialBulkAppConfigAllowListsPayload",
    "kind": "LinkedField",
    "name": "partialBulkUpdateAppConfigAllowLists",
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
    "name": "AppConfigFixtureDiagnosticsSectionRankMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AppConfigFixtureDiagnosticsSectionRankMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c41ea91ae9e7bd641216cbe2c87b55cb",
    "id": null,
    "metadata": {},
    "name": "AppConfigFixtureDiagnosticsSectionRankMutation",
    "operationKind": "mutation",
    "text": "mutation AppConfigFixtureDiagnosticsSectionRankMutation(\n  $items: [UpdateAppConfigAllowListInput!]!\n) {\n  partialBulkUpdateAppConfigAllowLists(input: {items: $items}) {\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e50683994df94db7837e3d9897b89c63";

export default node;
