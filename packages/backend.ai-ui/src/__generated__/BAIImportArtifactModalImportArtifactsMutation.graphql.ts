/**
 * @generated SignedSource<<607b1df7379c784ecf0520b25dabf569>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type ImportArtifactsInput = {
  artifactRevisionIds: ReadonlyArray<string>;
  options?: ImportArtifactsOptionsGQL | null | undefined;
  vfolderId?: string | null | undefined;
};
export type ImportArtifactsOptionsGQL = {
  force?: boolean;
};
export type BAIImportArtifactModalImportArtifactsMutation$variables = {
  connectionIds: ReadonlyArray<string>;
  input: ImportArtifactsInput;
};
export type BAIImportArtifactModalImportArtifactsMutation$data = {
  readonly importArtifacts: {
    readonly artifactRevisions: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly status: ArtifactStatus;
        };
      }>;
    };
    readonly tasks: ReadonlyArray<{
      readonly artifactRevision: {
        readonly version: string;
      };
      readonly taskId: string | null | undefined;
    }>;
  } | null | undefined;
};
export type BAIImportArtifactModalImportArtifactsMutation = {
  response: BAIImportArtifactModalImportArtifactsMutation$data;
  variables: BAIImportArtifactModalImportArtifactsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connectionIds"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "taskId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "version",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
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
        (v5/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "status",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIImportArtifactModalImportArtifactsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "ImportArtifactsPayload",
        "kind": "LinkedField",
        "name": "importArtifacts",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactRevisionImportTask",
            "kind": "LinkedField",
            "name": "tasks",
            "plural": true,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ArtifactRevision",
                "kind": "LinkedField",
                "name": "artifactRevision",
                "plural": false,
                "selections": [
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "artifactRevisions",
            "plural": false,
            "selections": [
              (v6/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIImportArtifactModalImportArtifactsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "ImportArtifactsPayload",
        "kind": "LinkedField",
        "name": "importArtifacts",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactRevisionImportTask",
            "kind": "LinkedField",
            "name": "tasks",
            "plural": true,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ArtifactRevision",
                "kind": "LinkedField",
                "name": "artifactRevision",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "artifactRevisions",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "appendEdge",
                "key": "",
                "kind": "LinkedHandle",
                "name": "edges",
                "handleArgs": [
                  {
                    "kind": "Variable",
                    "name": "connections",
                    "variableName": "connectionIds"
                  }
                ]
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7ff02c568f1c337b76719e22a948ac6b",
    "id": null,
    "metadata": {},
    "name": "BAIImportArtifactModalImportArtifactsMutation",
    "operationKind": "mutation",
    "text": "mutation BAIImportArtifactModalImportArtifactsMutation(\n  $input: ImportArtifactsInput!\n) {\n  importArtifacts(input: $input) {\n    tasks {\n      taskId\n      artifactRevision {\n        version\n        id\n      }\n    }\n    artifactRevisions {\n      edges {\n        node {\n          id\n          status\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7918fb18108ff64999034b77bf975aa9";

export default node;
