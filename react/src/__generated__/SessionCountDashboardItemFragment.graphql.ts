/**
 * @generated SignedSource<<1c18b2c1f6d2c47cad007156e1e69829>>
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
      "defaultValue": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\"",
      "kind": "LocalArgument",
      "name": "batchFilter"
    },
    {
      "defaultValue": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\"",
      "kind": "LocalArgument",
      "name": "inferenceFilter"
    },
    {
      "defaultValue": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\"",
      "kind": "LocalArgument",
      "name": "interactiveFilter"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scopeId"
    },
    {
      "defaultValue": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\"",
      "kind": "LocalArgument",
      "name": "systemFilter"
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
          "kind": "Variable",
          "name": "filter",
          "variableName": "interactiveFilter"
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
          "kind": "Variable",
          "name": "filter",
          "variableName": "batchFilter"
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
          "kind": "Variable",
          "name": "filter",
          "variableName": "inferenceFilter"
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
          "kind": "Variable",
          "name": "filter",
          "variableName": "systemFilter"
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

(node as any).hash = "62fd6c06a208e3f17511370116de6c21";

export default node;
