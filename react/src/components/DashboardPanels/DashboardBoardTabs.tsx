/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { generateUUID } from '../../helper/uuid';
import BAIFormItem from '../BAIFormItem';
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
import { IconButton } from '@lablup/ui-common/IconButton';
import { Tab } from '@lablup/ui-common/TabList';
import {
  BAIFlex,
  BAIModal,
  BAIPopconfirm,
  BAITabList,
  BAITextInput,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import { Plus, SquarePenIcon, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardBoardTabsProps {
  page: Extract<PanelPage, 'projectAdmin' | 'admin'>;
  boards: DashboardBoardsState;
  catalog: ReadonlyArray<PanelDefinition>;
}

interface BoardFormValues {
  title: string;
}

/** Switches, adds, edits and removes an admin dashboard's boards. */
const DashboardBoardTabs: React.FC<DashboardBoardTabsProps> = ({
  page,
  boards,
  catalog,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [editingBoard, setEditingBoard] = useState<DashboardModel | null>(null);
  const [form] = Form.useForm<BoardFormValues>();
  const { config, activeBoard, update } = boards;

  const titleOf = (board: DashboardModel) =>
    board.title || t('dashboard.boards.DefaultBoard');
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
    <>
      {/* The actions sit beside the tab list, not in its rail, so the rail's divider never clips them. */}
      <BAIFlex direction="row" align="center" gap="sm">
        <BAIFlex style={{ flex: 1, minWidth: 0 }}>
          <BAITabList
            value={activeBoard.id}
            onChange={(id) => update((current) => selectBoard(current, id))}
            aria-label={t('dashboard.boards.Boards')}
          >
            {config.boards.map((board) => (
              <Tab key={board.id} value={board.id} label={titleOf(board)} />
            ))}
          </BAITabList>
        </BAIFlex>
        <BAIFlex direction="row" align="center" gap="xxs">
          <IconButton
            variant="ghost"
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
            icon={<Plus size="1em" />}
            label={t('dashboard.boards.NewBoard')}
            onClick={addNewBoard}
          />
        </BAIFlex>
      </BAIFlex>
      <BAIUnmountAfterClose>
        <BAIModal
          open={!!editingBoard}
          title={t('dashboard.boards.EditBoard')}
          okText={t('button.Save')}
          onCancel={() => setEditingBoard(null)}
          onOk={() => {
            if (!editingBoard) return;
            form.validateFields().then(
              ({ title }) => {
                update((current) =>
                  renameBoard(current, editingBoard.id, title),
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
              <BAITextInput aria-label={t('dashboard.boards.BoardName')} />
            </BAIFormItem>
          </Form>
        </BAIModal>
      </BAIUnmountAfterClose>
    </>
  );
};

export default DashboardBoardTabs;
