/**
 * @generated SignedSource<<7a33e1fe09e416bfc362b26ff38a4ad8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ImportArtifactRevisionToFolderModalTestQuery$variables = Record<PropertyKey, never>;
export type ImportArtifactRevisionToFolderModalTestQuery$data = {
  readonly artifact: {
    readonly revisions: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"ImportArtifactRevisionToFolderModalArtifactRevisionFragment">;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type ImportArtifactRevisionToFolderModalTestQuery = {
  response: ImportArtifactRevisionToFolderModalTestQuery$data;
  variables: ImportArtifactRevisionToFolderModalTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-artifact-id"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ImportArtifactRevisionToFolderModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "artifact",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "revisions",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ArtifactRevisionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ArtifactRevision",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "ImportArtifactRevisionToFolderModalArtifactRevisionFragment"
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisions(limit:1)"
          }
        ],
        "storageKey": "artifact(id:\"test-artifact-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ImportArtifactRevisionToFolderModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "artifact",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "revisions",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ArtifactRevisionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ArtifactRevision",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisions(limit:1)"
          },
          (v2/*: any*/)
        ],
        "storageKey": "artifact(id:\"test-artifact-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "0d9222ee27823e386dad421dce929fd2",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "artifact": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Artifact"
        },
        "artifact.id": (v3/*: any*/),
        "artifact.revisions": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ArtifactRevisionConnection"
        },
        "artifact.revisions.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ArtifactRevisionEdge"
        },
        "artifact.revisions.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ArtifactRevision"
        },
        "artifact.revisions.edges.node.id": (v3/*: any*/)
      }
    },
    "name": "ImportArtifactRevisionToFolderModalTestQuery",
    "operationKind": "query",
    "text": "query ImportArtifactRevisionToFolderModalTestQuery {\n  artifact(id: \"test-artifact-id\") {\n    revisions(limit: 1) {\n      edges {\n        node {\n          ...ImportArtifactRevisionToFolderModalArtifactRevisionFragment\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment ImportArtifactRevisionToFolderModalArtifactRevisionFragment on ArtifactRevision {\n  id\n}\n"
  }
};
})();

(node as any).hash = "600331dd5f235d9b6927069186cf2a72";

export default node;
