import { Plus } from 'lucide-react';
import React, { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useServerDelete, useServerGet, useServerPost } from './api/api.js';
import { getCsrfToken } from './api/csrf.js';
import ConfirmDialog from './ConfirmDialog.js';
import DataSetView from './DataSetView.js';
import type { GridLabels, RowAction } from './Grid.js';
import Grid from './Grid.js';
import type { DialogLabels } from './ServerGridEditDialog.js';
import ServerGridEditDialog from './ServerGridEditDialog.js';
import './styles/Admin.css';

type ServerGridLabels = {
  loading?: string;
  add?: string;
  updateFailed?: string;
  itemUpdated?: string;
  listViewRequiresProps?: string;
  confirmDeleteTitle?: string;
  confirmDeleteMessage?: string;
  confirmDeleteLabel?: string;
  deletingLabel?: string;
  cancelLabel?: string;
  editTitle?: string;
  addTitle?: string;
  grid?: GridLabels;
  dialog?: DialogLabels;
};

type ColumnConfig = {
  field: string;
  displayName?: string;
  valueGetter?: (row: RowData) => unknown;
};

type ServerGridProps = {
  columns: Array<string | ColumnConfig>;
  columnRenderers?: Record<string, React.ComponentType<{ value: unknown; data: RowData }>>;
  path: string;
  allowEditing: boolean;
  allowDelete: boolean;
  pageSize: number;
  showAddButton: boolean;
  formComponent?: React.ComponentType<FormComponentProps>;
  transformAddPayload?: (payload: Record<string, unknown>, context: { path: string }) => Record<string, unknown>;
  transformEditPayload?: (payload: Record<string, unknown>, context?: { path: string }) => Record<string, unknown>;
  query?: string;
  viewMode?: 'grid' | 'list';
  renderItem?: React.ComponentType<{ data: RowData }>;
  loadPage?: (page: number) => Promise<RowData[]>;
  getApiBase: () => string;
  showNot: (message: string, type: 'success' | 'error') => void;
  onAddUsers?: (row: RowData) => void;
  rowActions?: RowAction[];
  labels?: ServerGridLabels;
};

type FormComponentProps = {
  data: FormDataState;
  setData: Dispatch<SetStateAction<FormDataState>>;
};

type PayloadProp = {
  name?: string;
  first_name?: string;
  last_name?: string;
  id?: number | string;
  created_at?: string;
  updated_at?: string;
};

type FormDataState = Record<string, unknown>;
type RowData = Record<string, unknown>;

export default function ServerGrid({
  columns,
  columnRenderers,
  path,
  allowEditing = false,
  allowDelete = false,
  pageSize = 20,
  showAddButton = true,
  formComponent: FormComponent,
  transformAddPayload,
  transformEditPayload,
  query,
  viewMode,
  renderItem,
  loadPage,
  getApiBase,
  showNot,
  onAddUsers,
  rowActions,
  labels = {},
  ...rest // anything else you want to pass to Grid
}: ServerGridProps): React.JSX.Element {
  const text = useMemo(
    () => ({
      loading: labels.loading ?? 'Loading...',
      add: labels.add ?? 'Add',
      updateFailed: labels.updateFailed ?? 'Failed to update item',
      itemUpdated: labels.itemUpdated ?? 'Item updated successfully!',
      listViewRequiresProps: labels.listViewRequiresProps ?? 'List view requires both renderItem and loadPage props.',
      confirmDeleteTitle: labels.confirmDeleteTitle ?? 'Confirm deletion',
      confirmDeleteMessage: labels.confirmDeleteMessage ?? 'Are you sure you want to remove this item?',
      confirmDeleteLabel: labels.confirmDeleteLabel ?? 'Delete',
      deletingLabel: labels.deletingLabel ?? 'Deleting...',
      cancelLabel: labels.cancelLabel ?? 'Cancel',
      editTitle: labels.editTitle ?? 'Edit',
      addTitle: labels.addTitle ?? 'Add',
    }),
    [labels],
  );
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [formData, setFormData] = useState<FormDataState>({});
  const [deleteTarget, setDeleteTarget] = useState<RowData | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const isListMode = viewMode === 'list';
  // const { showNotification } = showNot();

  // If search query changes, jump back to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Use hooks for HTTP operations
  const fetchData = useServerGet(path, currentPage, query ?? '', setData, setTotalPages, setLoading, setError, getApiBase);
  const performDelete = useServerDelete(path, fetchData, setError, showNot, getApiBase);
  const handleAddRow = useServerPost(path, fetchData, setIsAdding, transformAddPayload, showNot, getApiBase);

  useEffect(() => {
    if (!isListMode) {
      fetchData();
    }
  }, [fetchData, isListMode]);

  const handleDeleteRequest = (row: RowData) => {
    if (!row || !row.id) return;
    setDeleteTarget(row);
  };

  const handleEditRequest = (row: RowData) => {
    if (!row || !row.id) {
      console.error('Row has no ID');
      return;
    }
    // Set form data to row's data and open edit dialog
    setFormData({ ...row });
    setEditingRow(row);
    setIsEditing(true);
  };

  const handleCloseEditModal = () => {
    setIsEditing(false);
    setEditingRow(null);
    setFormData({});
  };

  const handleSaveEdit = async () => {
    if (!editingRow || !editingRow.id) {
      console.error('No row to edit');
      return;
    }

    try {
      let updateUrl = `${path.split('?')[0]}/${editingRow.id}`;
      if (!updateUrl.startsWith('/api/')) {
        const cleanPath = updateUrl.startsWith('/') ? updateUrl.slice(1) : updateUrl;
        updateUrl = `/api/${cleanPath}`;
      }

      // Clone formData and drop non-updatable technical fields
      const payload: Record<string, unknown> = { ...formData };

      // Remove technical/metadata fields (but NOT confirmPassword yet - transformEditPayload needs it for validation)
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.username;

      // Remove "name" field if first_name/last_name exist
      if ('first_name' in payload || 'last_name' in payload) {
        delete payload.name;
      }

      // Apply transformEditPayload if provided
      let finalPayload = typeof transformEditPayload === 'function' ? transformEditPayload(payload, { path }) : payload;

      // Remove confirmPassword after transformation
      delete finalPayload.confirmPassword;

      const res = await fetch(getApiBase() + updateUrl, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(finalPayload),
      });

      if (!res.ok) {
        let msg = text.updateFailed;
        try {
          const errorData = await res.json();
          msg = errorData.error || errorData.message || msg;
        } catch (_) {
          // ignore json parse error
        }
        throw new Error(msg);
      }

      // Refresh from server so grid matches DB
      await fetchData();
      handleCloseEditModal();
      showNot(text.itemUpdated, 'success');
    } catch (err: unknown) {
      console.error('Edit error:', err);
      const message = err instanceof Error ? err.message : text.updateFailed;
      showNot(message, 'error');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleAdd = () => {
    setFormData({});
    setIsAdding(true);
  };

  const handleCloseAddModal = () => {
    setIsAdding(false);
    setFormData({});
  };

  return (
    <div style={{ position: 'relative' }}>
      {loading && <div className="grid-loading-overlay">{text.loading}</div>}
      {error && <div className="grid-error-message">{error}</div>}

      {/* Add Button */}
      {showAddButton && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1rem',
          }}
        >
          <button onClick={handleAdd} className="server-grid-add-button" type="button" aria-label={text.add} title={text.add}>
            <Plus size={20} />
          </button>
        </div>
      )}

      {isListMode ? (
        renderItem && loadPage ? (
          <DataSetView render={renderItem} loadPage={loadPage} />
        ) : (
          <div className="grid-error-message">{text.listViewRequiresProps}</div>
        )
      ) : (
        <Grid
          columns={columns}
          columnRenderers={columnRenderers ?? {}}
          data={data}
          allowEditing={allowEditing}
          allowDelete={allowDelete}
          pageSize={pageSize}
          onEditRow={handleEditRequest}
          onDeleteRow={handleDeleteRequest}
          {...(labels.grid !== undefined ? { labels: labels.grid } : {})}
          {...(onAddUsers ? { onAddUsers } : {})}
          {...(rowActions ? { rowActions } : {})}
          {...rest}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title={text.confirmDeleteTitle}
          message={text.confirmDeleteMessage}
          confirmLabel={isDeleting ? text.deletingLabel : text.confirmDeleteLabel}
          cancelLabel={text.cancelLabel}
          onCancel={() => {
            if (isDeleting) return;
            setDeleteTarget(null);
          }}
          onConfirm={async () => {
            if (isDeleting || !deleteTarget) return;
            setIsDeleting(true);
            try {
              await performDelete(deleteTarget);
              setDeleteTarget(null);
            } finally {
              setIsDeleting(false);
            }
          }}
          isDestructive={true}
        />
      )}

      {isAdding && FormComponent && (
        <ServerGridEditDialog
          isEditing={false}
          onCancel={handleCloseAddModal}
          onSave={() => handleAddRow(formData)}
          formComponent={<FormComponent data={formData} setData={setFormData} />}
          labels={{
            ...(labels.dialog ?? {}),
            title: text.addTitle,
          }}
        />
      )}

      {isEditing && FormComponent && editingRow && (
        <ServerGridEditDialog
          isEditing={true}
          onCancel={handleCloseEditModal}
          onSave={handleSaveEdit}
          formComponent={<FormComponent data={formData} setData={setFormData} />}
          labels={{
            ...(labels.dialog ?? {}),
            title: text.editTitle,
          }}
        />
      )}
      {/* Pagination Controls */}
      {!isListMode && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '20px',
            alignItems: 'center',
          }}
        >
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            {labels.grid?.previous ?? 'Previous'}
          </button>
          <span>
            {labels.grid?.page ?? 'Page'} {currentPage} {labels.grid?.of ?? 'of'} {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            {labels.grid?.next ?? 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
