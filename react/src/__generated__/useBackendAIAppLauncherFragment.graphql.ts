/**
 * @generated SignedSource<<1ca3a0c611d751d96deb4d7c6e9d00b2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useBackendAIAppLauncherFragment$data = {
  readonly name: string | null | undefined;
  readonly project_id: string | null | undefined;
  readonly row_id: string;
  readonly scaling_group: string | null | undefined;
  readonly service_ports: string | null | undefined;
  readonly vfolder_mounts: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly " $fragmentType": "useBackendAIAppLauncherFragment";
} | null | undefined;
export type useBackendAIAppLauncherFragment$key = {
  readonly " $data"?: useBackendAIAppLauncherFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useBackendAIAppLauncherFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useBackendAIAppLauncherFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "row_id",
        "storageKey": null
      },
      "action": "NONE"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "vfolder_mounts",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scaling_group",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "project_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "service_ports",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "0298c44a1e59684bc84794c23f4bcfbf";

export default node;
