/**
 * @generated SignedSource<<cf99f63c7dc61f9285ea240ec223073c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionCountDashboardItemFragment$data = {
  readonly myBatch: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly myInference: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly myInteractive: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly myUpload: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "SessionCountDashboardItemFragment";
};
export type SessionCountDashboardItemFragment$key = {
  readonly " $data"?: SessionCountDashboardItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionCountDashboardItemFragment">;
};

import SessionCountDashboardItemRefetchQuery_graphql from './SessionCountDashboardItemRefetchQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = {
  "kind": "Literal",
  "name": "first",
  "value": 0
},
v1 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
},
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scopeId"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [],
      "operation": SessionCountDashboardItemRefetchQuery_graphql
    }
  },
  "name": "SessionCountDashboardItemFragment",
  "selections": [
    {
      "alias": "myInteractive",
      "args": [
        {
          "kind": "Literal",
          "name": "filter",
          "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\""
        },
        (v0/*: any*/),
        (v1/*: any*/)
      ],
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "compute_session_nodes",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "alias": "myBatch",
      "args": [
        {
          "kind": "Literal",
          "name": "filter",
          "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\""
        },
        (v0/*: any*/),
        (v1/*: any*/)
      ],
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "compute_session_nodes",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "alias": "myInference",
      "args": [
        {
          "kind": "Literal",
          "name": "filter",
          "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\""
        },
        (v0/*: any*/),
        (v1/*: any*/)
      ],
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "compute_session_nodes",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "alias": "myUpload",
      "args": [
        {
          "kind": "Literal",
          "name": "filter",
          "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\""
        },
        (v0/*: any*/),
        (v1/*: any*/)
      ],
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "compute_session_nodes",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "19e666cf346850c01eda18c6889928ae";

export default node;
