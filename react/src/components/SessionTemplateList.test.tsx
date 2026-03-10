/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import * as useSessionTemplatesModule from '../hooks/useSessionTemplates';
import type { SessionTemplate } from '../hooks/useSessionTemplates';
import SessionTemplateList from './SessionTemplateList';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

jest.mock('../pages/SessionLauncherPage', () => ({
  ResourceNumbersOfSession: ({
    resource,
  }: {
    resource: Record<string, unknown>;
  }) => <span data-testid="resource-numbers">{JSON.stringify(resource)}</span>,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      if (opts?.name) return `${key} ${opts.name}`;
      return key;
    },
  }),
}));

jest.mock('antd', () => {
  const confirmMock = jest.fn();
  return {
    App: {
      useApp: () => ({
        modal: { confirm: confirmMock },
      }),
    },
    Button: ({
      children,
      onClick,
      loading,
      disabled,
      ...rest
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      loading?: boolean;
      disabled?: boolean;
    }) => (
      <button onClick={onClick} disabled={disabled || loading} {...rest}>
        {children}
      </button>
    ),
    Tag: ({ children }: { children: React.ReactNode }) => (
      <span data-testid="tag">{children}</span>
    ),
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    theme: {
      useToken: () => ({
        token: { fontSizeSM: 12, colorInfo: '#1677ff' },
      }),
    },
  };
});

jest.mock('backend.ai-ui', () => ({
  BAIButton: ({
    children,
    onClick,
    loading,
    disabled,
    ...rest
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled || loading} {...rest}>
      {children}
    </button>
  ),
  BAIConfirmModalWithInput: ({
    open,
    onOk,
    onCancel,
    title,
  }: {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    title: React.ReactNode;
    confirmText: string;
    content: React.ReactNode;
    okText?: string;
  }) =>
    open ? (
      <div data-testid="confirm-modal">
        <span>{title}</span>
        <button data-testid="confirm-ok" onClick={onOk}>
          OK
        </button>
        <button data-testid="confirm-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
  BAIFetchKeyButton: ({ onChange }: { onChange: () => void }) => (
    <button data-testid="refresh-btn" onClick={onChange}>
      Refresh
    </button>
  ),
  BAIFlex: ({
    children,
    ...rest
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="bai-flex" {...rest}>
      {children}
    </div>
  ),
  BAITable: ({
    dataSource,
    columns,
  }: {
    dataSource: SessionTemplate[];
    columns: Array<{
      key: string;
      dataIndex?: keyof SessionTemplate;
      render?: (value: unknown, record: SessionTemplate) => React.ReactNode;
    }>;
  }) => (
    <table data-testid="session-template-table">
      <tbody>
        {dataSource.map((record) => (
          <tr key={record.id} data-testid="template-row">
            {columns.map((col) => (
              <td key={col.key} data-testid={`col-${col.key}`}>
                {col.render
                  ? col.render(
                      col.dataIndex ? record[col.dataIndex] : undefined,
                      record,
                    )
                  : col.dataIndex
                    ? String(record[col.dataIndex] ?? '-')
                    : '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  filterOutNullAndUndefined: <T,>(arr: (T | null | undefined)[]) =>
    arr.filter((item): item is T => item != null),
}));

const makeTemplate = (
  overrides: Partial<SessionTemplate> = {},
): SessionTemplate => ({
  id: 'tmpl-1',
  name: 'my-template',
  type: 'task',
  is_active: true,
  domain_name: 'default',
  user: 'user-uuid',
  user_email: 'user@example.com',
  group: null,
  group_name: null,
  is_owner: true,
  created_at: '2024-01-15T12:00:00Z',
  template: {
    api_version: 'v2.0',
    kind: 'session',
    metadata: { name: 'my-template', tag: null },
    spec: {
      session_type: 'interactive',
      kernel: { image: 'python:3.11-ubuntu22.04' },
      resources: { cpu: '4', mem: String(4 * 1024 ** 3) },
    },
  },
  ...overrides,
});

const getConfirmMock = () => {
  const antd = jest.requireMock('antd') as {
    App: { useApp: () => { modal: { confirm: jest.Mock } } };
  };
  return antd.App.useApp().modal.confirm;
};

describe('SessionTemplateList', () => {
  const mockRefresh = jest.fn();
  const mockDeleteTemplate = jest.fn();

  const defaultHookReturn = {
    sessionTemplates: [makeTemplate()],
    isLoading: false,
    error: null,
    refresh: mockRefresh,
    createTemplate: jest.fn(),
    isCreating: false,
    updateTemplate: jest.fn(),
    isUpdating: false,
    deleteTemplate: mockDeleteTemplate,
    isDeleting: false,
  };

  const mockHook = jest.spyOn(useSessionTemplatesModule, 'useSessionTemplates');

  beforeEach(() => {
    mockHook.mockReturnValue(defaultHookReturn);
    mockDeleteTemplate.mockResolvedValue(undefined);
    getConfirmMock().mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockHook.mockReset();
  });

  it('renders the table with session templates', () => {
    render(<SessionTemplateList />);

    expect(screen.getByTestId('session-template-table')).toBeInTheDocument();
    expect(screen.getAllByTestId('template-row')).toHaveLength(1);
  });

  it('renders the refresh button', () => {
    render(<SessionTemplateList />);

    expect(screen.getByTestId('refresh-btn')).toBeInTheDocument();
  });

  it('calls refresh when refresh button is clicked', () => {
    render(<SessionTemplateList />);

    fireEvent.click(screen.getByTestId('refresh-btn'));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls onCreate when the Create button is clicked', () => {
    const mockOnCreate = jest.fn();
    render(<SessionTemplateList onCreate={mockOnCreate} />);

    fireEvent.click(screen.getByText('button.Create'));

    expect(mockOnCreate).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit with the template record when Edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    const template = makeTemplate();
    mockHook.mockReturnValue({
      ...defaultHookReturn,
      sessionTemplates: [template],
    });

    render(<SessionTemplateList onEdit={mockOnEdit} />);

    const editButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.closest('[data-testid="col-controls"]'));
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(template);
  });

  it('opens confirmation modal when Delete button is clicked', () => {
    const confirmMock = getConfirmMock();
    const template = makeTemplate();
    mockHook.mockReturnValue({
      ...defaultHookReturn,
      sessionTemplates: [template],
    });

    render(<SessionTemplateList />);

    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.closest('[data-testid="col-controls"]'));
    fireEvent.click(deleteButtons[1]);

    expect(confirmMock).toHaveBeenCalledTimes(1);
  });

  it('calls deleteTemplate with the correct id when deletion is confirmed', async () => {
    const confirmMock = getConfirmMock();
    const template = makeTemplate({ id: 'tmpl-42' });
    mockHook.mockReturnValue({
      ...defaultHookReturn,
      sessionTemplates: [template],
    });

    render(<SessionTemplateList />);

    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.closest('[data-testid="col-controls"]'));
    fireEvent.click(deleteButtons[1]);

    const { onOk } = confirmMock.mock.calls[0][0];
    await onOk();

    await waitFor(() => {
      expect(mockDeleteTemplate).toHaveBeenCalledWith('tmpl-42');
    });
  });

  it('shows an empty table when there are no templates', () => {
    mockHook.mockReturnValue({
      ...defaultHookReturn,
      sessionTemplates: [],
    });

    render(<SessionTemplateList />);

    expect(screen.getByTestId('session-template-table')).toBeInTheDocument();
    expect(screen.queryAllByTestId('template-row')).toHaveLength(0);
  });
});
