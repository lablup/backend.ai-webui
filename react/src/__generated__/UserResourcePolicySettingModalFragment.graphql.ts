/**
 * @generated SignedSource<<c174f2aae0611f9833328ac9b877be73>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserResourcePolicySettingModalFragment$data = {
  readonly id: string;
  readonly max_customized_image_count: number | null | undefined;
  readonly max_quota_scope_size: any | null | undefined;
  readonly max_session_count_per_model_session: number | null | undefined;
  readonly max_vfolder_count: number | null | undefined;
  readonly name: string;
  readonly " $fragmentType": "UserResourcePolicySettingModalFragment";
};
export type UserResourcePolicySettingModalFragment$key = {
  readonly " $data"?: UserResourcePolicySettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserResourcePolicySettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserResourcePolicySettingModalFragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_vfolder_count",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_session_count_per_model_session",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_quota_scope_size",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_customized_image_count",
      "storageKey": null
    }
  ],
  "type": "UserResourcePolicy",
  "abstractKey": null
};

(node as any).hash = "d93790c2b9fef92baa6999ce770cd9da";

export default node;
