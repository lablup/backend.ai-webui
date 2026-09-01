/**
 * @generated SignedSource<<175bbf053bf29b9c9dfa2ffe826999d1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AppLaunchConfirmationModalFragment$data = {
  readonly id: string;
  readonly name: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"useBackendAIAppLauncherFragment">;
  readonly " $fragmentType": "AppLaunchConfirmationModalFragment";
};
export type AppLaunchConfirmationModalFragment$key = {
  readonly " $data"?: AppLaunchConfirmationModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AppLaunchConfirmationModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AppLaunchConfirmationModalFragment",
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
      "name": "row_id",
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "useBackendAIAppLauncherFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "13a6ab8b5554436f3588b5f5fc41d8bb";

export default node;
