import { BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key } from '../../__generated__/BAIAllowedVfolderHostsWithPermissionFromGroupFragment.graphql';
import { BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key } from '../../__generated__/BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment.graphql';
import { BAIAllowedVfolderHostsWithPermissionQuery } from '../../__generated__/BAIAllowedVfolderHostsWithPermissionQuery.graphql';
import {
  SemanticColor,
  v2AllowedVfolderHostsToRecord,
  type V2AllowedVfolderHostEntry,
} from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAILink from '../BAILink';
import BAIModal from '../BAIModal';
import { BAITable } from '../Table';
import { useTheme } from '@astryxdesign/core/theme';
import * as _ from 'lodash-es';
import { CircleCheck, Ban, LockIcon, LockOpenIcon } from 'lucide-react';
import React from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

export type BAIAllowedVfolderHostsWithPermissionProps =
  | {
      allowedHostPermissionFrgmtFromKeyPair: BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key;
      allowedHostPermissionFrgmtFromGroup?: never;
      allowedVfolderHostEntries?: never;
    }
  | {
      allowedHostPermissionFrgmtFromKeyPair?: never;
      allowedHostPermissionFrgmtFromGroup: BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key;
      allowedVfolderHostEntries?: never;
    }
  | {
      allowedHostPermissionFrgmtFromKeyPair?: never;
      allowedHostPermissionFrgmtFromGroup?: never;
      /**
       * The Strawberry V2 `[VFolderHostPermissionEntry!]` shape, for callers
       * on a V2 node that has no JSONString field to spread a fragment from.
       */
      allowedVfolderHostEntries: ReadonlyArray<V2AllowedVfolderHostEntry>;
    };

const BAIAllowedVfolderHostsWithPermission: React.FC<
  BAIAllowedVfolderHostsWithPermissionProps
> = ({
  allowedHostPermissionFrgmtFromKeyPair,
  allowedHostPermissionFrgmtFromGroup,
  allowedVfolderHostEntries,
}) => {
  const { t } = useBAIi18n();
  const { token } = useTheme();
  const [storageHost, setStorageHost] = React.useState<string | null>();

  const keypairResourcePolicy =
    useFragment<BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key>(
      graphql`
        fragment BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment on KeyPairResourcePolicy {
          allowed_vfolder_hosts
        }
      `,
      allowedHostPermissionFrgmtFromKeyPair,
    );

  const groupNode =
    useFragment<BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key>(
      graphql`
        fragment BAIAllowedVfolderHostsWithPermissionFromGroupFragment on GroupNode {
          allowed_vfolder_hosts
        }
      `,
      allowedHostPermissionFrgmtFromGroup,
    );

  const allowedVfolderHosts: Record<string, string[]> =
    allowedVfolderHostEntries
      ? v2AllowedVfolderHostsToRecord(allowedVfolderHostEntries)
      : JSON.parse(
          keypairResourcePolicy?.allowed_vfolder_hosts ||
            groupNode?.allowed_vfolder_hosts ||
            '{}',
        );

  const { vfolder_host_permissions } =
    useLazyLoadQuery<BAIAllowedVfolderHostsWithPermissionQuery>(
      graphql`
        query BAIAllowedVfolderHostsWithPermissionQuery {
          vfolder_host_permissions {
            vfolder_host_permission_list
          }
        }
      `,
      {},
    );

  const getColor = (vfolderHost: string): SemanticColor => {
    if (
      _.isEqual(
        new Set(allowedVfolderHosts[vfolderHost]),
        new Set(vfolder_host_permissions?.vfolder_host_permission_list || null),
      )
    ) {
      return 'success';
    } else if (allowedVfolderHosts[vfolderHost]?.length > 0) {
      return 'warning';
    } else {
      return 'error';
    }
  };

  return (
    <>
      <BAIFlex gap="xs" wrap="wrap">
        {_.map(_.keys(allowedVfolderHosts), (storageHost) => {
          const color = getColor(storageHost);
          return (
            <BAILink
              key={storageHost}
              onClick={() => {
                setStorageHost(storageHost);
              }}
              type="hover"
            >
              <BAIFlex gap="xxs" align="center">
                {color === 'error' ? (
                  <LockIcon
                    size={14}
                    aria-hidden="true"
                    focusable={false}
                    style={{ color: token('--color-error') }}
                  />
                ) : (
                  <LockOpenIcon
                    size={14}
                    aria-hidden="true"
                    focusable={false}
                    style={{
                      color:
                        color === 'success'
                          ? token('--color-success')
                          : token('--color-warning'),
                    }}
                  />
                )}
                {storageHost}
              </BAIFlex>
            </BAILink>
          );
        })}
      </BAIFlex>
      <BAIModal
        centered
        title={`${storageHost} ${t('comp:AllowedVfolderHostsWithPermission.Permission')}`}
        open={!_.isEmpty(storageHost)}
        onCancel={() => setStorageHost(null)}
        footer={null}
      >
        <BAITable
          pagination={false}
          size="small"
          dataSource={_.map(
            vfolder_host_permissions?.vfolder_host_permission_list,
            (permission) => ({
              key: permission,
              permission,
              isAllowed: _.includes(
                _.get(allowedVfolderHosts, storageHost || ''),
                permission,
              ),
            }),
          )}
          columns={[
            {
              title: t('comp:AllowedVfolderHostsWithPermission.Permission'),
              dataIndex: 'permission',
              key: 'permission',
            },
            {
              title: t('comp:AllowedVfolderHostsWithPermission.Allowed'),
              dataIndex: 'isAllowed',
              key: 'isAllowed',
              render: (isAllowed: boolean) => (
                <BAIFlex justify="center">
                  {isAllowed ? (
                    <CircleCheck
                      style={{
                        color: token('--preset-green-5'),
                        fontSize: token('--font-size-lg'),
                      }}
                      size="1em"
                    />
                  ) : (
                    <Ban
                      style={{
                        color: token('--preset-red-5'),
                        fontSize: token('--font-size-lg'),
                      }}
                      size="1em"
                    />
                  )}
                </BAIFlex>
              ),
            },
          ]}
        />
      </BAIModal>
    </>
  );
};

export default BAIAllowedVfolderHostsWithPermission;
