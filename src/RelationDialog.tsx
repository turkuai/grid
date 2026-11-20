import { Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { getCsrfToken } from './api/csrf.js';
import DataSetView from './DataSetView';
import './RelationDialog.css';

type RowData = Record<string, any>;

export type RelationDialogProps = {
  title: string;
  heading: string;
  searchPlaceholder: string;
  cancelLabel: string;

  fetchUrl: string;
  addUrl: (id: number | string) => string;

  entityLabel: string;
  entityLabelPlural: string;

  getApiBase: () => string;

  getRecordId: (data: RowData) => number | string;
  getRecords: (response: any) => RowData[];
  renderRecord: (data: RowData, selected: boolean) => React.ReactNode;

  onClose: () => void;
  onAdded?: () => void;
};

export default function RelationDialog({
  title,
  heading,
  searchPlaceholder,
  cancelLabel,
  fetchUrl,
  addUrl,
  entityLabel,
  entityLabelPlural,
  getApiBase,
  getRecordId,
  getRecords,
  renderRecord,
  onClose,
  onAdded,
}: RelationDialogProps) {
  const [selectedToAdd, setSelectedToAdd] = useState<(number | string)[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Build API URL using the same convention as ServerGrid
  const apiUrl = (path: string) => {
    const base = getApiBase().replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');

    const apiPath = cleanPath.startsWith('api/') ? `/${cleanPath}` : `/api/${cleanPath}`;

    return `${base}${apiPath}`;
  };

  const loadPage = useCallback(
    async (page: number): Promise<RowData[]> => {
      setFetchError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
        });

        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim());
        }

        const url = apiUrl(fetchUrl);
        const separator = url.includes('?') ? '&' : '?';

        const response = await fetch(`${url}${separator}${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load ${entityLabelPlural.toLowerCase()}.`);
        }

        const responseData = await response.json();

        return getRecords(responseData);
      } catch (error: unknown) {
        setFetchError(error instanceof Error ? error.message : 'Network error');

        return [];
      }
    },
    [fetchUrl, searchQuery, entityLabelPlural, getApiBase, getRecords],
  );

  const toggleId = (id: number | string) => {
    setSelectedToAdd((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]));
  };

  const handleAddRecords = async () => {
    if (!selectedToAdd.length || isAdding) return;

    setIsAdding(true);
    setFetchError(null);

    try {
      for (const id of selectedToAdd) {
        const response = await fetch(apiUrl(addUrl(id)), {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
          },
        });

        if (!response.ok) {
          const body = await response.text();

          throw new Error(body || `Failed to add ${entityLabel.toLowerCase()}.`);
        }
      }

      onAdded?.();
      onClose();
    } catch (error: unknown) {
      setFetchError(error instanceof Error ? error.message : `Failed to add ${entityLabelPlural.toLowerCase()}.`);
    } finally {
      setIsAdding(false);
    }
  };

  const RecordOption = ({ data }: { data: RowData }) => {
    const id = getRecordId(data);
    const checked = selectedToAdd.includes(id);

    return (
      <div className={`record-item${checked ? ' selected' : ''}`} onClick={() => toggleId(id)}>
        <input type="checkbox" className="record-checkbox" checked={checked} readOnly tabIndex={-1} />

        {renderRecord(data, checked)}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content relation-modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>

          <button className="modal-close" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {fetchError && (
          <div
            style={{
              color: '#dc2626',
              margin: '0.75rem 0',
              padding: '0.75rem',
              background: '#fee2e2',
              borderRadius: '6px',
            }}
          >
            {fetchError}
          </div>
        )}

        <div className="modal-body">
          <h3>{heading}</h3>

          <div className="record-autocomplete-input-wrap" style={{ marginBottom: '0.75rem' }}>
            <Search size={16} className="record-autocomplete-icon" />

            <input
              type="search"
              className="record-autocomplete-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSelectedToAdd([]);
              }}
              autoComplete="off"
            />
          </div>

          <div className="record-autocomplete-list" style={{ height: '300px', padding: 0 }}>
            <DataSetView key={`${fetchUrl}-${searchQuery}`} render={RecordOption} loadPage={loadPage} />
          </div>

          <div className="modal-footer">
            <button className="cancel-btn" type="button" onClick={onClose}>
              {cancelLabel}
            </button>

            <button className="confirm-btn" type="button" onClick={handleAddRecords} disabled={!selectedToAdd.length || isAdding}>
              {isAdding ? `Adding ${selectedToAdd.length}…` : `Add ${selectedToAdd.length} ${entityLabelPlural}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
