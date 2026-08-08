/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionInfoCellFragment$key } from '../../__generated__/SessionInfoCellFragment.graphql';
import { Form, type FormInstance } from '../../form-engine';
import {
  // useBackendaiImageMetaData,
  useSuspendedBackendaiClient,
} from '../../hooks';
import { useTanMutation } from '../../hooks/reactQueryAlias';
import { AstryxFormTextInput } from '../astryxFormControls';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePen } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

const isRunningStatus = (status: string = '') => {
  return [
    'RUNNING',
    'RESTARTING',
    'TERMINATING',
    'PENDING',
    'SCHEDULED',
    'PREPARING',
    'PREPARED',
    'CREATING',
    'PULLING',
  ].includes(status);
};

const isPreparing = (status: string = '') => {
  return [
    'RESTARTING',
    'PREPARING',
    'PREPARED',
    'CREATING',
    'PULLING',
  ].includes(status);
};

const SessionInfoCell: React.FC<{
  sessionFrgmt: SessionInfoCellFragment$key;
  sessionNameList: string[];
  onRename?: () => void;
}> = ({ sessionFrgmt, sessionNameList, onRename }) => {
  const baiClient = useSuspendedBackendaiClient();
  const session = useFragment(
    graphql`
      fragment SessionInfoCellFragment on ComputeSession {
        id
        session_id
        name
        status
        user_email
        image
      }
    `,
    sessionFrgmt,
  );

  // const metadata = useBackendaiImageMetaData();

  const mutation = useTanMutation({
    mutationFn: (newName: string) => {
      const sessionId =
        baiClient.APIMajorVersion < 5 ? session.name : session.session_id;
      return baiClient.rename(sessionId, newName);
    },
  });

  const formRef = useRef<FormInstance>(null);
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);
  const [optimisticName, setOptimisticName] = useState(session.name);
  const editable =
    isRunningStatus(session.status || undefined) &&
    !isPreparing(session.status || undefined) &&
    baiClient.email === session.user_email;

  const save = () => {
    formRef.current
      ?.validateFields()
      .then(({ name }) => {
        setEditing(false);
        if (session.name === name) return;
        setOptimisticName(name);
        mutation.mutate(name, {
          onSuccess: () => {
            onRename && onRename();
          },
          onError: () => {
            setOptimisticName(session.name);
          },
        });
      })
      .catch(() => {});
  };

  const isPendingRename = mutation.isPending || optimisticName !== session.name;

  return (
    <Form ref={formRef}>
      {editing ? (
        <Form.Item
          style={{ margin: 0 }}
          name={'name'}
          rules={[
            {
              required: true,
            },
            {
              max: 64,
            },
            {
              pattern: /^(?:[a-zA-Z0-9][-a-zA-Z0-9._]{2,}[a-zA-Z0-9])?$/,
              message: t('session.validation.EnterValidSessionName'),
            },
            () => ({
              validator(_form, value) {
                if (
                  _.without(sessionNameList, session.name).includes(
                    String(value),
                  )
                ) {
                  return Promise.reject(
                    new Error(t('session.validation.SessionNameAlreadyExist')),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          {/* The inline rename field. `onEnter` / `onKeyDown` / `hasAutoFocus`
              are on the SHARED adapter now (D10 fold-back), so this no longer
              needs a local copy of the two `Form.Item` contracts. */}
          <AstryxFormTextInput
            label={t('session.launcher.SessionName')}
            hasAutoFocus
            onEnter={save}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        </Form.Item>
      ) : (
        <BAIFlex style={{ maxWidth: 250 }}>
          {/* `ellipsis={{tooltip}}` -> `maxLines` + `hasTruncateTooltip`
              (MAPPING §3.4); the tooltip's `overlayInnerStyle` width override
              is dropped — Astryx's truncation tooltip sizes itself. */}
          <Text
            maxLines={1}
            hasTruncateTooltip
            color={isPendingRename ? 'secondary' : undefined}
          >
            {optimisticName}
          </Text>
          {editable && (
            // MAPPING §3.3: icon-only -> `IconButton`. The `colorLink` glyph
            // tint is dropped (P5, closed variant enum), and the required
            // `label` gives the control its first accessible name.
            <IconButton
              isLoading={isPendingRename}
              variant="ghost"
              size="sm"
              icon={<SquarePen size="1em" />}
              label={t('button.Edit')}
              tooltip={t('button.Edit')}
              onClick={() => {
                formRef.current?.setFieldsValue({
                  name: session.name,
                });
                setEditing(true);
              }}
            />
          )}
        </BAIFlex>
      )}
    </Form>
  );
};

export default SessionInfoCell;
