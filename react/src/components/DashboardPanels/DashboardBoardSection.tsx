/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { generateUUID } from '../../helper/uuid';
import './DashboardBoardSection.css';
import {
  addBoard,
  createEmptyBoard,
  removeBoard,
  renameBoard,
  selectBoard,
} from './dashboardConfig';
import type { DashboardModel, PanelDefinition, PanelPage } from './types';
import type { DashboardBoardsState } from './useDashboardBoards';
import { Button } from '@lablup/ui-common/Button';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIFlex,
  BAIPopconfirm,
  BAISelector,
  BAIText,
  BAITextInput,
} from 'backend.ai-ui';
import { Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardBoardSectionProps {
  page: Extract<PanelPage, 'projectAdmin' | 'admin'>;
  boards: DashboardBoardsState;
  catalog: ReadonlyArray<PanelDefinition>;
}

/**
 * The edit sider's board block on the admin pages: picks the active board,
 * renames it in place, and adds or removes boards. The tabs only switch.
 */
const DashboardBoardSection: React.FC<DashboardBoardSectionProps> = ({
  page,
  boards,
  catalog,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const { config, activeBoard, update } = boards;
  // An unsaved name belongs to the board it was typed for.
  const [draft, setDraft] = useState<{ boardId: string; title: string }>();

  const titleOf = (board: DashboardModel) =>
    board.title || t('dashboard.boards.DefaultBoard');
  const name =
    draft?.boardId === activeBoard.id ? draft.title : titleOf(activeBoard);
  const isNameEmpty = !name.trim();
  const canDelete = config.boards.length > 1;

  const commitName = () => {
    if (draft?.boardId !== activeBoard.id || isNameEmpty) return;
    if (name.trim() !== titleOf(activeBoard)) {
      update((current) => renameBoard(current, activeBoard.id, name));
    }
    setDraft(undefined);
  };
  const addNewBoard = () => {
    update((current) =>
      addBoard(
        current,
        createEmptyBoard(
          {
            id: generateUUID(),
            title: t('dashboard.boards.NewBoardTitle', {
              number: current.boards.length + 1,
            }),
          },
          catalog,
          page,
        ),
      ),
    );
  };

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      data-testid="dashboard-board-section"
    >
      <BAIText strong>{t('dashboard.boards.Boards')}</BAIText>
      <BAISelector
        size="sm"
        width="100%"
        aria-label={t('dashboard.boards.Boards')}
        options={config.boards.map((board) => ({
          value: board.id,
          label: titleOf(board),
        }))}
        value={activeBoard.id}
        onChange={(id) => update((current) => selectBoard(current, id))}
        data-testid="dashboard-board-select"
      />
      <BAIFlex direction="column" align="stretch" gap="xxs">
        <BAIText type="secondary" style={{ fontSize: token('--font-size-sm') }}>
          {t('dashboard.boards.BoardName')}
        </BAIText>
        <BAITextInput
          size="sm"
          width="100%"
          aria-label={t('dashboard.boards.BoardName')}
          value={name}
          status={isNameEmpty ? 'error' : ''}
          onChange={(title) => setDraft({ boardId: activeBoard.id, title })}
          onEnter={commitName}
          onBlur={commitName}
          data-testid="dashboard-board-name"
        />
        {isNameEmpty ? (
          <BAIText
            type="danger"
            style={{ fontSize: token('--font-size-sm') }}
            role="alert"
          >
            {t('dashboard.boards.BoardNameRequired')}
          </BAIText>
        ) : null}
      </BAIFlex>
      <BAIFlex direction="row" align="center" gap="xs" wrap="wrap">
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size="1em" />}
          label={t('dashboard.boards.NewBoard')}
          onClick={addNewBoard}
          data-testid="dashboard-board-add"
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
          <Button
            variant="secondary"
            size="sm"
            icon={<Trash2 size="1em" />}
            label={t('dashboard.boards.DeleteBoard')}
            className="dashboard-board-delete"
            isDisabled={!canDelete}
            tooltip={
              canDelete
                ? undefined
                : t('dashboard.boards.CannotDeleteLastBoard')
            }
            data-testid="dashboard-board-delete"
          />
        </BAIPopconfirm>
      </BAIFlex>
    </BAIFlex>
  );
};

export default DashboardBoardSection;
