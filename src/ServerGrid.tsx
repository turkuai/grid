import { Plus } from 'lucide-react';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useServerDelete, useServerGet, useServerPost } from './api/api.js';
import { getCsrfToken } from './api/csrf.js';
import ConfirmDialog from './ConfirmDialog.js';
import DataSetView from './DataSetView.js';
import type { RowAction } from './Grid.js';
import Grid from './Grid.js';
import ServerGridEditDialog from './ServerGridEditDialog.js';
import './styles/Admin.css';

type ServerGridProps = {
  columns: string[];
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
  rowActions?: RowAction[];
};

type FormComponentProps = {
  data: FormDataState;
  setData: Dispatch<SetStateAction<FormDataState>>;
  errors?: Record<string, string[]>;
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
  rowActions,
  ...rest
}: ServerGridProps): React.JSX.Element {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [formData, setFormData] = useState<FormDataState>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [deleteTarget, setDeleteTarget] = useState<RowData | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const isListMode = viewMode === 'list';

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const fetchData = useServerGet(path, currentPage, query ?? '', setData, setTotalPages, setLoading, setError, getApiBase);

  const performDelete = useServerDelete(path, fetchData, setError, showNot, getApiBase);

  const handleAddRow = useServerPost(path, fetchData, setIsAdding, setValidationErrors, transformAddPayload, showNot, getApiBase);

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

    setFormData({ ...row });
    setValidationErrors({});
    setEditingRow(row);
    setIsEditing(true);
  };

  const handleCloseEditModal = () => {
    setIsEditing(false);
    setEditingRow(null);
    setFormData({});
    setValidationErrors({});
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

      const payload: Record<string, unknown> = { ...formData };

      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      const finalPayload = typeof transformEditPayload === 'function' ? transformEditPayload(payload, { path }) : payload;

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
        let msg = 'Failed to update item';

        try {
          const errorData = await res.json();

          if (errorData.errors) {
            setValidationErrors(errorData.errors);
          }

          msg = errorData.error || errorData.message || msg;
        } catch (_) {
          // ignore json parse error
        }

        throw new Error(msg);
      }

      await fetchData();
      handleCloseEditModal();
      showNot('Item updated successfully!', 'success');
    } catch (err: unknown) {
      console.error('Edit error:', err);
      const message = err instanceof Error ? err.message : 'Failed to update item';
      showNot(message, 'error');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleAdd = () => {
    setFormData({});
    setValidationErrors({});
    setIsAdding(true);
  };

  const handleCloseAddModal = () => {
    setIsAdding(false);
    setFormData({});
    setValidationErrors({});
  };

  return (
    <div style={{ position: 'relative' }}>
      {loading && <div className="grid-loading-overlay">Loading...</div>}

      {error && <div className="grid-error-message">{error}</div>}

      {showAddButton && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1rem',
          }}
        >
          <button onClick={handleAdd} className="server-grid-add-button" type="button">
            <Plus size={20} />
          </button>
        </div>
      )}

      {isListMode ? (
        renderItem && loadPage ? (
          <DataSetView render={renderItem} loadPage={loadPage} />
        ) : (
          <div className="grid-error-message">List view requires both renderItem and loadPage props.</div>
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
          {...(rowActions ? { rowActions } : {})}
          {...rest}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Confirm deletion"
          message="Are you sure you want to remove this item?"
          confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
          cancelLabel="Cancel"
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
          formComponent={<FormComponent data={formData} setData={setFormData} errors={validationErrors} />}
        />
      )}

      {isEditing && FormComponent && editingRow && (
        <ServerGridEditDialog
          isEditing={true}
          onCancel={handleCloseEditModal}
          onSave={handleSaveEdit}
          formComponent={<FormComponent data={formData} setData={setFormData} errors={validationErrors} />}
        />
      )}

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
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
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
            Next
          </button>
        </div>
      )}
    </div>
  );
}
