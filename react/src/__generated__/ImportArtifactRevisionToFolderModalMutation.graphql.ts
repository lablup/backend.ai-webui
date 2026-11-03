/**
 * @generated SignedSource<<53af1b671726e1ddcc75dfaa5c1eeb8a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImportArtifactsInput = {
  artifactRevisionIds: ReadonlyArray<string>;
  options?: ImportArtifactsOptions | null | undefined;
  vfolderId?: string | null | undefined;
};
export type ImportArtifactsOptions = {
  force?: boolean;
};
export type ImportArtifactRevisionToFolderModalMutation$variables = {
  input: ImportArtifactsInput;
};
export type ImportArtifactRevisionToFolderModalMutation$data = {
  readonly importArtifacts: {
    readonly artifactRevisions: {
      readonly count: number;
    };
    readonly tasks: ReadonlyArray<{
      readonly artifactRevision: {
        readonly artifact: {
          readonly entityId: string;
          readonly id: string;
          readonly name: string;
        } | null | undefined;
        readonly id: string;
        readonly version: string;
      };
      readonly taskId: string | null | undefined;
    }>;
  } | null | undefined;
};
export type ImportArtifactRevisionToFolderModalMutation = {
  response: ImportArtifactRevisionToFolderModalMutation$data;
  variables: ImportArtifactRevisionToFolderModalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "ImportArtifactsPayload",
    "kind": "LinkedField",
    "name": "importArtifacts",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ArtifactRevisionConnection",
        "kind": "LinkedField",
        "name": "artifactRevisions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "count",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "ArtifactRevisionImportTask",
        "kind": "LinkedField",
        "name": "tasks",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "taskId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactRevision",
            "kind": "LinkedField",
            "name": "artifactRevision",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "version",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Artifact",
                "kind": "LinkedField",
                "name": "artifact",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
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
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ImportArtifactRevisionToFolderModalMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ImportArtifactRevisionToFolderModalMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "262f08ff2a989f5cccb0d71fe230e8ac",
    "id": null,
    "metadata": {},
    "name": "ImportArtifactRevisionToFolderModalMutation",
    "operationKind": "mutation",
    "text": "mutation ImportArtifactRevisionToFolderModalMutation(\n  $input: ImportArtifactsInput!\n) {\n  importArtifacts(input: $input) {\n    artifactRevisions {\n      count\n    }\n    tasks {\n      taskId\n      artifactRevision {\n        id\n        version\n        artifact {\n          id\n          entityId\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "259eea7c2fef122ffd906edd5d7b9a4c";

export default node;
