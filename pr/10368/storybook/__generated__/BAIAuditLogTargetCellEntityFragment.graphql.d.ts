import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIAuditLogTargetCellEntityFragment$data = {
    readonly __typename: "AppConfigAllowList";
    readonly configName: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "AppConfigDefinition";
    readonly configName: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "AppConfigFragment";
    readonly configName: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "Artifact";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "ArtifactRegistry";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "ComputeSessionNode";
    readonly sessionName: string | null | undefined;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "ContainerRegistryV2";
    readonly registryName: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "DomainV2";
    readonly basicInfo: {
        readonly name: string;
    };
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "IdleChecker";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "ImageV2";
    readonly identity: {
        readonly canonicalName: string;
    };
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "ModelDeployment";
    readonly metadata: {
        readonly name: string;
    };
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "NotificationChannel";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "NotificationRule";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "ObjectStorage";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "ProjectV2";
    readonly basicInfo: {
        readonly name: string;
    };
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "ResourceGroup";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "Role";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "RuntimeVariant";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "RuntimeVariantPreset";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "SessionV2";
    readonly metadata: {
        readonly name: string;
    };
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "StorageNamespace";
    readonly namespace: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "UserV2";
    readonly basicInfo: {
        readonly email: string;
    };
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "VFSStorage";
    readonly name: string;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "VFolder";
    readonly metadata: {
        readonly name: string;
    };
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "VirtualFolderNode";
    readonly vfolderName: string | null | undefined;
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
    readonly __typename: "%other";
    readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
};
export type BAIAuditLogTargetCellEntityFragment$key = {
    readonly " $data"?: BAIAuditLogTargetCellEntityFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellEntityFragment">;
};
declare const node: ReaderFragment;
export default node;
