/**
 * @generated SignedSource<<fcfd18f9839657c28c148ab6ee725c39>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AppLauncherModalFragment$data = {
  readonly access_key: string | null | undefined;
  readonly id: string;
  readonly name: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly service_ports: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"AppLaunchConfirmationModalFragment" | "SFTPConnectionInfoModalFragment" | "TensorboardPathModalFragment" | "useBackendAIAppLauncherFragment">;
  readonly " $fragmentType": "AppLauncherModalFragment";
};
export type AppLauncherModalFragment$key = {
  readonly " $data"?: AppLauncherModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AppLauncherModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AppLauncherModalFragment",
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "service_ports",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "access_key",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useBackendAIAppLauncherFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SFTPConnectionInfoModalFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TensorboardPathModalFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AppLaunchConfirmationModalFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "b9346907e8767b7907308075e50985ca";

export default node;
