/**
 * @generated SignedSource<<b8abc44b951505a08bab81be2dfea97d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RolePermissionSummaryTableFragment$data = {
  readonly entityId: string;
  readonly id: string;
  readonly scopeType: string;
  readonly source: RoleSource;
  readonly " $fragmentType": "RolePermissionSummaryTableFragment";
};
export type RolePermissionSummaryTableFragment$key = {
  readonly " $data"?: RolePermissionSummaryTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RolePermissionSummaryTableFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RolePermissionSummaryTableFragment",
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
      "name": "entityId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "source",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scopeType",
      "storageKey": null
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "2e57a393be624854bb12947fd7f58937";

export default node;
