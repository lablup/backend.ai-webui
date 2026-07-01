/**
 * @generated SignedSource<<6e4fcfff9abea66150a4e0e2be7291e9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt$data = ReadonlyArray<{
  readonly allowedVfolderHosts: ReadonlyArray<{
    readonly host: string;
    readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
  }>;
  readonly id: string;
  readonly keypairs?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly accessKey: string;
        readonly id: string;
        readonly user: {
          readonly organization: {
            readonly mainAccessKey: string | null | undefined;
          };
        } | null | undefined;
      };
    }>;
  } | null | undefined;
  readonly name: string;
  readonly " $fragmentType": "KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt";
}>;
export type KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt$key = ReadonlyArray<{
  readonly " $data"?: KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "includeKeypairs"
    },
    {
      "kind": "RootArgument",
      "name": "keypairFilter"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderHostPermissionEntry",
      "kind": "LinkedField",
      "name": "allowedVfolderHosts",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "host",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "permissions",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "condition": "includeKeypairs",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "filter",
              "variableName": "keypairFilter"
            }
          ],
          "concreteType": "KeyPairConnection",
          "kind": "LinkedField",
          "name": "keypairs",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "KeyPairV2Edge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "KeyPairV2",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    (v0/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "accessKey",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "UserV2",
                      "kind": "LinkedField",
                      "name": "user",
                      "plural": false,
                      "selections": [
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
                              "name": "mainAccessKey",
                              "storageKey": null
                            }
                          ],
                          "storageKey": null
                        }
                      ],
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "KeypairResourcePolicyV2",
  "abstractKey": null
};
})();

(node as any).hash = "800b150bbf0d2d323b61562a2d653b80";

export default node;
