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
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
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

/**
 * The inline rename field.
 *
 * Raw Astryx `TextInput` rather than the shared `AstryxFormTextInput` adapter:
 * this field needs Enter-to-save and Escape-to-cancel, which the adapter's
 * prop surface does not carry. The two `Form.Item` contracts the adapter
 * exists for are honoured here instead — `value` is coalesced (Astryx types it
 * non-nullable, antd injects `undefined` until the field is touched) and
 * `onChange` receives the VALUE, not the event.
 *
 * antd's `onPressEnter` is Astryx's `onEnter`; the `onKeyUp` Escape handler
 * becomes `onKeyDown`, the key event Astryx exposes.
 */
const InlineNameInput: React.FC<{
  label: string;
  onEnter: () => void;
  onEscape: () => void;
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
}> = ({ label, onEnter, onEscape, value, onChange }) => {
  'use memo';
  return (
    <TextInput
      label={label}
      isLabelHidden
      hasAutoFocus
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      onEnter={onEnter}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onEscape();
      }}
    />
  );
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
          <InlineNameInput
            label={t('session.launcher.SessionName')}
            onEnter={save}
            onEscape={() => setEditing(false)}
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
