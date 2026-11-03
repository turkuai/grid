import { Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import DataSetView from './DataSetView';
import './RelationDialog.css';

type RelationDialogProps = {
  title: string;
  heading: string;
  searchPlaceholder: string;
  cancelLabel: string;

  fetchUrl: string;
  addUrl: (id: number | string) => string;

  entityLabel: string;
  entityLabelPlural: string;
  getApiBase: () => string;

  onClose: () => void;
  onUserAdded?: () => void;

  renderRecord?: (data: Record<string, any>, selected: boolean) => React.ReactNode;
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
  onClose,
  getApiBase,
  onUserAdded,
  renderRecord,
}: RelationDialogProps) {
  const [selectedToAdd, setSelectedToAdd] = useState<(number | string)[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const apiUrl = (path: string) => `${getApiBase()}/api/${path.replace(/^\/+/, '')}`;
  // Extract records from API response.
  const getRows = (response: any): any[] => {
    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.users)) {
      return response.users;
    }

    if (Array.isArray(response?.patients)) {
      return response.patients;
    }

    return [];
  };

  // Fetch available (unregistered) records.
  const loadPage = useCallback(
    async (page: number) => {
      setFetchError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
        });

        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim());
        }

        const separator = fetchUrl.includes('?') ? '&' : '?';

        const response = await fetch(`${apiUrl(fetchUrl)}?${params.toString()}`, {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load ${entityLabelPlural.toLowerCase()}.`);
        }

        const data = await response.json();

        return getRows(data);
      } catch (error: any) {
        setFetchError(error.message || 'Network error');
        return [];
      }
    },
    [fetchUrl, searchQuery, entityLabelPlural],
  );

  // Select or unselect records locally.
  // No API request happens here.
  const toggleId = (id: number | string) => {
    setSelectedToAdd((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]));
  };

  // Save selected records only when Add is clicked.
  const handleAddRecords = async () => {
    if (!selectedToAdd.length || isAdding) {
      return;
    }

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
          },
        });

        if (!response.ok) {
          const body = await response.text();

          throw new Error(body || `Failed to add ${entityLabel.toLowerCase()}.`);
        }
      }

      onUserAdded?.();
      onClose();
    } catch (error: any) {
      setFetchError(error.message || `Failed to add ${entityLabelPlural.toLowerCase()}.`);
    } finally {
      setIsAdding(false);
    }
  };

  // Record rendering.
  const RecordOption = ({ data }: { data: Record<string, any> }) => {
    const checked = selectedToAdd.includes(data.id);

    return (
      <div className={`user-autocomplete-option${checked ? ' selected' : ''}`} onClick={() => toggleId(data.id)}>
        {renderRecord ? (
          renderRecord(data, checked)
        ) : (
          <>
            <input type="checkbox" className="user-list-checkbox" checked={checked} readOnly tabIndex={-1} />

            <span className="user-autocomplete-name">
              {data.name || [data.first_name, data.last_name].filter(Boolean).join(' ') || `#${data.id}`}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content group-users-modal" onClick={(event) => event.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>{title}</h2>

          <button className="modal-close" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Error */}
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
          {/* Heading */}
          <h3>{heading}</h3>

          {/* Search */}
          <div className="user-autocomplete-input-wrap" style={{ marginBottom: '0.75rem' }}>
            <Search size={16} className="user-autocomplete-icon" />

            <input
              type="search"
              className="user-autocomplete-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSelectedToAdd([]);
              }}
              autoComplete="off"
            />
          </div>

          {/* Available records */}
          <div
            className="user-autocomplete-list"
            style={{
              height: '300px',
              padding: 0,
            }}
          >
            <DataSetView key={`${fetchUrl}-${searchQuery}`} render={RecordOption} loadPage={loadPage} />
          </div>

          {/* Footer */}
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
