/**
 * @generated SignedSource<<4b5f72a1eb4ffb365ce0d4851c595e46>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AdminUserManagement_userConnection$data = {
  readonly count: number;
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly basicInfo: {
        readonly email: string;
      };
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"BAIAdminUserV2TableFragment" | "PurgeUsersModalFragment" | "UpdateUsersModalFragment" | "UserInfoModalFragment" | "UserSettingModalFragment">;
    };
  }>;
  readonly " $fragmentType": "AdminUserManagement_userConnection";
};
export type AdminUserManagement_userConnection$key = {
  readonly " $data"?: AdminUserManagement_userConnection$data;
  readonly " $fragmentSpreads": FragmentRefs<"AdminUserManagement_userConnection">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AdminUserManagement_userConnection",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "count",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2Edge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "UserV2",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
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
                }
              ],
              "storageKey": null
            },
            {
              "args": [
                {
                  "kind": "Literal",
                  "name": "withProjects",
                  "value": true
                }
              ],
              "kind": "FragmentSpread",
              "name": "BAIAdminUserV2TableFragment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "PurgeUsersModalFragment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UpdateUsersModalFragment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserInfoModalFragment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserSettingModalFragment"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "UserV2Connection",
  "abstractKey": null
};

(node as any).hash = "531c97a25ab7d8338bb826f92d8cd4f6";

export default node;
