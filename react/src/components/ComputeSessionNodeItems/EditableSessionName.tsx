/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { EditableSessionNameFragment$key } from '../../__generated__/EditableSessionNameFragment.graphql';
import { EditableSessionNameRefetchQuery } from '../../__generated__/EditableSessionNameRefetchQuery.graphql';
import { App } from '../../app-shim';
import { Form } from '../../form-engine';
import { useBaiSignedRequestWithPromise } from '../../helper';
import { useCurrentUserInfo } from '../../hooks/backendai';
import { useTanMutation } from '../../hooks/reactQueryAlias';
import { useValidateSessionName } from '../../hooks/useValidateSessionName';
// FRONTIER (ticket 17 / ticket 34): the inline rename editor keeps the antd
// Form ENGINE (Form + Form.Item) — locked SHIM decision. The control inside
// the item is Astryx now.
import { AstryxFormTextInput } from '../astryxFormControls';
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { CheckIcon, CopyIcon, PencilIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  fetchQuery,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

/**
 * PILOT-DECISION (ticket 17): the antd `Typography.Text/Title editable
 * copyable` surface (P11 — behaviour delivered by antd Typography itself) is
 * rebuilt with Astryx primitives: `Heading`/`Text` + ghost `IconButton`s for
 * copy and rename. The props are Astryx-shaped (`level`, `editable`,
 * `dimmed`) instead of forwarding antd Typography props; the terminated /
 * pending "tertiary" text colour maps to the closed `disabled` TextColor.
 * The after-edit focus restore of the old implementation is dropped
 * (defaults-first; the edit affordance is a real focusable button now).
 */
type EditableSessionNameProps = {
  sessionFrgmt: EditableSessionNameFragment$key;
  /** Render as a Heading of this level; body text when omitted. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Allow renaming (further gated by ownership + session status). */
  editable?: boolean;
  /** Muted display for terminated/cancelled sessions. */
  dimmed?: boolean;
};

const EditableSessionName: React.FC<EditableSessionNameProps> = ({
  sessionFrgmt,
  level,
  editable: editableOfProps = false,
  dimmed = false,
}) => {
  'use memo';
  const relayEvn = useRelayEnvironment();

  const session = useFragment(
    graphql`
      fragment EditableSessionNameFragment on ComputeSessionNode {
        id
        row_id
        name
        priority
        user_id
        status
        project_id @required(action: THROW)
      }
    `,
    sessionFrgmt,
  );

  const [optimisticName, setOptimisticName] = useState(session.name);
  const validationRules = useValidateSessionName(optimisticName);
  const [userInfo] = useCurrentUserInfo();

  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const renameSessionMutation = useTanMutation({
    mutationFn: (newName: string) => {
      return baiRequestWithPromise({
        method: 'POST',
        url: `/session/${session.name}/rename`,
        body: {
          name: newName,
        },
      });
    },
  });

  const { t } = useTranslation();
  const { message } = App.useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const isNotPreparingCategoryStatus = ![
    'RESTARTING',
    'PREPARING',
    'PREPARED',
    'CREATING',
    'PULLING',
  ].includes(session.status || '');

  const isEditingAllowed =
    editableOfProps &&
    userInfo.uuid === session.user_id &&
    isNotPreparingCategoryStatus;

  const isPendingRenamingAndRefreshing =
    renameSessionMutation.isPending || optimisticName !== session.name;

  const displayedName =
    renameSessionMutation.isPending || optimisticName !== session.name
      ? optimisticName
      : session.name;
  const isDimmed = dimmed || isPendingRenamingAndRefreshing;

  return (
    <>
      {(!isEditing || isPendingRenamingAndRefreshing) && (
        <HStack gap={1} align="center">
          {level ? (
            <Heading level={level} color={isDimmed ? 'disabled' : undefined}>
              {displayedName}
            </Heading>
          ) : (
            <Text color={isDimmed ? 'disabled' : undefined}>
              {displayedName}
            </Text>
          )}
          <IconButton
            variant="ghost"
            size="sm"
            icon={copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
            label={t('sourceCodeViewer.Copy')}
            tooltip={t('sourceCodeViewer.Copy')}
            isDisabled={copied}
            onClick={() => {
              void navigator.clipboard?.writeText(displayedName ?? '');
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          />
          {isEditingAllowed && !isPendingRenamingAndRefreshing && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={<PencilIcon aria-hidden />}
              label={t('button.Edit')}
              tooltip={t('button.Edit')}
              onClick={() => setIsEditing(true)}
            />
          )}
        </HStack>
      )}
      {isEditing && !isPendingRenamingAndRefreshing && (
        <Form
          onFinish={(values) => {
            setIsEditing(false);
            setOptimisticName(values.sessionName);
            // FIXME: This API does not return any response on success or error.
            renameSessionMutation.mutate(values.sessionName, {
              onSuccess: () => {
                // refetch the updated session name
                fetchQuery<EditableSessionNameRefetchQuery>(
                  relayEvn,
                  graphql`
                    query EditableSessionNameRefetchQuery(
                      $sessionId: GlobalIDField!
                      $scope_id: ScopeField
                    ) {
                      compute_session_node(
                        id: $sessionId
                        scope_id: $scope_id
                      ) {
                        id
                        name
                      }
                    }
                  `,
                  {
                    sessionId: session.id,
                    scope_id: `project:${session.project_id}`,
                  },
                )
                  .toPromise()
                  // ignore the error
                  .catch();
              },
              onError: () => {
                // if the session name is not changed, do not show error
                if (session.name !== values.sessionName) {
                  message.error(t('session.FailToRenameSession'));
                }
              },
            });
          }}
          initialValues={{
            sessionName: session.name,
          }}
          style={{
            flex: 1,
          }}
        >
          <Form.Item name="sessionName" rules={validationRules}>
            {/* PILOT-DECISION (kept): the antd
                `suffix={<CornerDownLeftIcon/>}` "press Enter" hint is DROPPED
                — MAPPING §3.6 gives `suffix` no `TextInput` destination, and
                the only route (`InputGroup`) welds a bordered addon box that
                reads as a button, not as the faint inline hint this was.

                `size` and `onKeyDown` are on the SHARED adapter now (D10
                fold-back), so this no longer needs a local copy of the
                `Form.Item` contracts. */}
            <AstryxFormTextInput
              label={t('session.SessionName')}
              size="lg"
              hasAutoFocus
              onKeyDown={(e) => {
                // when press escape key, cancel editing
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setIsEditing(false);
                }
              }}
            />
          </Form.Item>
        </Form>
      )}
    </>
  );
};

export default EditableSessionName;
