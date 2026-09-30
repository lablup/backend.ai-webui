/**
 * @generated SignedSource<<c96d2055cf5aeb3ba20376e25e17b6fb>>
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
  supportsEntityId: boolean;
};
export type QuotaPerStorageVolumePanelCardUserQuery$data = {
  readonly legacyUser?: {
    readonly id: string | null | undefined;
  } | null | undefined;
  readonly myUserV2: {
    readonly entityId?: string;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "supportsEntityId"
  }
],
v1 = {
  "condition": "supportsEntityId",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "entityId",
      "storageKey": null
    }
  ]
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "condition": "supportsEntityId",
  "kind": "Condition",
  "passingValue": false,
  "selections": [
    {
      "alias": "legacyUser",
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
        (v2/*: any*/)
      ],
      "storageKey": null
    }
  ]
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "QuotaPerStorageVolumePanelCardUserQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      (v3/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "QuotaPerStorageVolumePanelCardUserQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      (v3/*: any*/)
    ]
  },
  "params": {
    "cacheID": "e0956684e67c7a96e7caf26280e7e3c8",
    "id": null,
    "metadata": {},
    "name": "QuotaPerStorageVolumePanelCardUserQuery",
    "operationKind": "query",
    "text": "query QuotaPerStorageVolumePanelCardUserQuery(\n  $domain_name: String\n  $email: String\n  $supportsEntityId: Boolean!\n) {\n  myUserV2 {\n    entityId @include(if: $supportsEntityId) @since(version: \"26.9.0\")\n    id\n  }\n  legacyUser: user(domain_name: $domain_name, email: $email) @skip(if: $supportsEntityId) @deprecatedSince(version: \"26.9.0\") {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "36369d64718f364e5d320c92f7d07354";

export default node;
