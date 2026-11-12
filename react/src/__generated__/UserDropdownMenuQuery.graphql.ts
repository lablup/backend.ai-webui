/**
 * @generated SignedSource<<d3191c618b525f75264e7f66c8c047c5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserDropdownMenuQuery$variables = {
  isNotSupportTotp: boolean;
};
export type UserDropdownMenuQuery$data = {
  readonly myClientIp: {
    readonly clientIp: string;
  } | null | undefined;
  readonly myUserV2: {
    readonly basicInfo: {
      readonly fullName: string | null | undefined;
    };
    readonly " $fragmentSpreads": FragmentRefs<"UserProfileSettingModalBodyFragment">;
  } | null | undefined;
};
export type UserDropdownMenuQuery = {
  response: UserDropdownMenuQuery$data;
  variables: UserDropdownMenuQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isNotSupportTotp"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fullName",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "MyClientIp",
  "kind": "LinkedField",
  "name": "myClientIp",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "clientIp",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UserDropdownMenuQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2BasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
              (v1/*: any*/)
            ],
            "storageKey": null
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "UserProfileSettingModalBodyFragment"
          }
        ],
        "storageKey": null
      },
      (v2/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserDropdownMenuQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2BasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "email",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
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
            "concreteType": "UserV2SecurityInfo",
            "kind": "LinkedField",
            "name": "security",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "totpActivated",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "allowedClientIp",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v2/*: any*/)
    ]
  },
  "params": {
    "cacheID": "72cdd42f58f945b40db58f0375f9e73e",
    "id": null,
    "metadata": {},
    "name": "UserDropdownMenuQuery",
    "operationKind": "query",
    "text": "query UserDropdownMenuQuery(\n  $isNotSupportTotp: Boolean!\n) {\n  myUserV2 {\n    basicInfo {\n      fullName\n    }\n    ...UserProfileSettingModalBodyFragment\n    id\n  }\n  myClientIp {\n    clientIp\n  }\n}\n\nfragment TOTPActivateModalFragment on UserV2 {\n  basicInfo {\n    email\n  }\n  security {\n    totpActivated @skip(if: $isNotSupportTotp) @skipOnClient(if: $isNotSupportTotp)\n  }\n}\n\nfragment UserProfileSettingModalBodyFragment on UserV2 {\n  id\n  basicInfo {\n    email\n    fullName\n  }\n  security {\n    totpActivated @skipOnClient(if: $isNotSupportTotp)\n    allowedClientIp\n  }\n  ...TOTPActivateModalFragment\n}\n"
  }
};
})();

(node as any).hash = "4292e90c51f4835a4e23aa127fa91d74";

export default node;
