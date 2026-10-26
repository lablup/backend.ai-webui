/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { generateUUID } from '../../helper/uuid';
import { useCurrentDomainValue } from '../../hooks';
import { useAccessibleProjects } from '../../hooks/useAccessibleProjects';
import BAIFormItem from '../BAIFormItem';
import ProjectSelect from '../ProjectSelect';
import { AstryxFormTextInput } from '../astryxFormControls';
import {
  addBoard,
  createBoardFromTemplate,
  removeBoard,
  renameBoard,
  selectBoard,
  setBoardPins,
} from './dashboardConfig';
import type { DashboardModel, PanelPage } from './types';
import type { DashboardBoardsState } from './useDashboardBoards';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Tab } from '@lablup/ui-common/TabList';
import {
  BAIFlex,
  BAIModal,
  BAIPopconfirm,
  BAISelect,
  BAITabList,
  BAIText,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Pin, Plus, SquarePenIcon, Trash2 } from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardBoardTabsProps {
  page: Extract<PanelPage, 'projectAdmin' | 'admin'>;
  boards: DashboardBoardsState;
}

interface BoardFormValues {
  title: string;
  pinnedProjects?: Array<string>;
}

/** Switches, adds, edits and removes an admin dashboard's boards. */
const DashboardBoardTabs: React.FC<DashboardBoardTabsProps> = ({
  page,
  boards,
}) => {
  'use memo';
  const { t } = useTranslation();
  const currentDomain = useCurrentDomainValue();
  const { groups } = useAccessibleProjects();
  const [editingBoard, setEditingBoard] = useState<DashboardModel | null>(null);
  const [form] = Form.useForm<BoardFormValues>();
  const { config, activeBoard, template, update } = boards;

  const projectNameById = new Map(
    _.compact(groups).map((project) => [project.id, project.name]),
  );
  const titleOf = (board: DashboardModel) =>
    board.title || t('dashboard.boards.DefaultBoard');
  const pinSummaryOf = (board: DashboardModel) => {
    const names = (board.pinned?.project ?? []).map(
      (id) => projectNameById.get(id) ?? id,
    );
    if (names.length === 0) return null;
    return names.length === 1
      ? names[0]
      : t('dashboard.boards.PinnedProjectsMore', {
          name: names[0],
          count: names.length - 1,
        });
  };

  const addNewBoard = () => {
    update((current) =>
      addBoard(
        current,
        createBoardFromTemplate(template, {
          id: generateUUID(),
          title: t('dashboard.boards.NewBoardTitle', {
            number: current.boards.length + 1,
          }),
        }),
      ),
    );
  };

  return (
    <>
      <BAITabList
        value={activeBoard.id}
        onChange={(id) => update((current) => selectBoard(current, id))}
        aria-label={t('dashboard.boards.Boards')}
        tabBarExtraContent={
          <BAIFlex direction="row" align="center" gap="xxs">
            <IconButton
              variant="ghost"
              size="sm"
              label={t('dashboard.boards.EditBoard')}
              tooltip={t('dashboard.boards.EditBoard')}
              icon={<SquarePenIcon size="1em" />}
              onClick={() => setEditingBoard(activeBoard)}
            />
            <BAIPopconfirm
              title={t('dialog.ask.DoYouWantToDeleteSomething', {
                name: titleOf(activeBoard),
              })}
              isDanger
              okText={t('button.Delete')}
              onConfirm={() =>
                update((current) => removeBoard(current, activeBoard.id))
              }
            >
              <IconButton
                variant="ghost"
                size="sm"
                label={t('button.Delete')}
                tooltip={
                  config.boards.length > 1
                    ? t('button.Delete')
                    : t('dashboard.boards.CannotDeleteLastBoard')
                }
                icon={<Trash2 size="1em" />}
                isDisabled={config.boards.length <= 1}
              />
            </BAIPopconfirm>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size="1em" />}
              label={t('dashboard.boards.NewBoard')}
              onClick={addNewBoard}
            />
          </BAIFlex>
        }
      >
        {config.boards.map((board) => {
          const pinSummary = pinSummaryOf(board);
          return (
            <Tab
              key={board.id}
              value={board.id}
              label={titleOf(board)}
              endContent={
                pinSummary ? (
                  <BAIFlex direction="row" align="center" gap="xxs">
                    <Pin size="0.85em" aria-hidden />
                    <BAIText type="secondary">{pinSummary}</BAIText>
                  </BAIFlex>
                ) : undefined
              }
            />
          );
        })}
      </BAITabList>
      <BAIUnmountAfterClose>
        <BAIModal
          open={!!editingBoard}
          title={t('dashboard.boards.EditBoard')}
          okText={t('button.Save')}
          onCancel={() => setEditingBoard(null)}
          onOk={() => {
            if (!editingBoard) return;
            form.validateFields().then(
              ({ title, pinnedProjects }) => {
                update((current) =>
                  setBoardPins(
                    renameBoard(current, editingBoard.id, title),
                    editingBoard.id,
                    pinnedProjects ?? [],
                  ),
                );
                setEditingBoard(null);
              },
              () => {},
            );
          }}
        >
          <Form
            form={form}
            layout="vertical"
            preserve={false}
            initialValues={{
              title: editingBoard ? titleOf(editingBoard) : '',
              pinnedProjects: editingBoard?.pinned?.project ?? [],
            }}
          >
            <BAIFormItem
              name="title"
              label={t('dashboard.boards.BoardName')}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t('dashboard.boards.BoardNameRequired'),
                },
              ]}
            >
              <AstryxFormTextInput label={t('dashboard.boards.BoardName')} />
            </BAIFormItem>
            <Suspense fallback={<BAISelect mode="multiple" loading disabled />}>
              <BAIFormItem
                name="pinnedProjects"
                label={t('dashboard.boards.PinnedProjects')}
                extra={t('dashboard.boards.PinnedProjectsDescription')}
              >
                <ProjectSelect
                  mode="multiple"
                  domain={currentDomain}
                  disableDefaultFilter={page === 'admin'}
                  aria-label={t('dashboard.boards.PinnedProjects')}
                />
              </BAIFormItem>
            </Suspense>
          </Form>
        </BAIModal>
      </BAIUnmountAfterClose>
    </>
  );
};

export default DashboardBoardTabs;
