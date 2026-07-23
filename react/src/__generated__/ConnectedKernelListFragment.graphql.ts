/**
 * @generated SignedSource<<c2b9e9640b4234caa238b90c16371674>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ConnectedKernelListFragment$data = ReadonlyArray<{
  readonly agent_id: string | null | undefined;
  readonly cluster_hostname: string | null | undefined;
  readonly cluster_idx: number | null | undefined;
  readonly cluster_role: string | null | undefined;
  readonly container_id: string | null | undefined;
  readonly id: string;
  readonly row_id: string | null | undefined;
  readonly status: string | null | undefined;
  readonly status_info: string | null | undefined;
  readonly " $fragmentType": "ConnectedKernelListFragment";
}>;
export type ConnectedKernelListFragment$key = ReadonlyArray<{
  readonly " $data"?: ConnectedKernelListFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ConnectedKernelListFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "ConnectedKernelListFragment",
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
      "name": "cluster_hostname",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cluster_idx",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cluster_role",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_info",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "agent_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "container_id",
      "storageKey": null
    }
  ],
  "type": "KernelNode",
  "abstractKey": null
};

(node as any).hash = "b07dcbdb178c221c667bd2f86f43cbd5";

export default node;
