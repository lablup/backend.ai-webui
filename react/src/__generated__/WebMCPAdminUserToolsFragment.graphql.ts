/**
 * @generated SignedSource<<19b7c3b46845528363f9eed05521e432>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type WebMCPAdminUserToolsFragment$data = ReadonlyArray<{
  readonly basicInfo: {
    readonly email: string;
    readonly fullName: string | null | undefined;
    readonly username: string | null | undefined;
  };
  readonly id: string;
  readonly organization: {
    readonly domainName: string | null | undefined;
    readonly mainAccessKey: string | null | undefined;
    readonly resourcePolicy: string;
    readonly role: UserRoleV2 | null | undefined;
  };
  readonly status: {
    readonly status: UserStatusV2;
  };
  readonly " $fragmentType": "WebMCPAdminUserToolsFragment";
}>;
export type WebMCPAdminUserToolsFragment$key = ReadonlyArray<{
  readonly " $data"?: WebMCPAdminUserToolsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"WebMCPAdminUserToolsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "WebMCPAdminUserToolsFragment",
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
      "concreteType": "UserV2BasicInfo",
      "kind": "LinkedField",
      "name": "basicInfo",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "email",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "fullName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "username",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2OrganizationInfo",
      "kind": "LinkedField",
      "name": "organization",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "domainName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "role",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "resourcePolicy",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "mainAccessKey",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2StatusInfo",
      "kind": "LinkedField",
      "name": "status",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "status",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "UserV2",
  "abstractKey": null
};

(node as any).hash = "48b934d7607c71ce19c347c2ccb062bf";

export default node;
