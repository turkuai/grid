import { useCallback } from 'react';
import { getCsrfToken } from './csrf.js';

type RowData = Record<string, unknown>;
export function useServerGet(path: string, currentPage: number, query: string,
  setData: React.Dispatch<React.SetStateAction<RowData[]>>,
  setTotalPages: React.Dispatch<React.SetStateAction<number>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  getApiBase: () => string) {
  const fetchData = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      // Build the full URL with page parameter
      let fullUrl = path;
      // Ensure /api/ prefix if not present; avoid accidental double slashes
      if (!fullUrl.startsWith('/api/')) {
        // Remove leading slash if present to avoid double slashes
        const cleanPath = fullUrl.startsWith('/') ? fullUrl.slice(1) : fullUrl;
        fullUrl = `/api/${cleanPath}`;
      }

      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl = `${fullUrl}${separator}page=${currentPage}`;

      // Optional server-side search
      const trimmedQuery = query.trim();
      if (trimmedQuery !== '') {
        fullUrl = `${fullUrl}&search=${encodeURIComponent(trimmedQuery)}`;
      }

      const res = await fetch(getApiBase() + fullUrl, {
        method: 'GET',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Parse response safely (handle HTML error pages)
      const contentType = res.headers.get('content-type') || '';
      let payload: unknown;

      if (contentType.includes('application/json')) {
        try {
          payload = await res.json();
        } catch (parseErr) {
          const text = await res.text().catch(() => '');
          const message = text
            ? `Invalid JSON response: ${text.slice(0, 200)}`
            : 'Invalid JSON response from server.';
          throw new Error(message);
        }
      } else {
        const text = await res.text().catch(() => '');
        const message = text
          ? `Unexpected response (status ${res.status}): ${text.slice(0, 200)}`
          : `Unexpected non-JSON response (status ${res.status}).`;
        throw new Error(message);
      }

      const payloadObj = (!Array.isArray(payload) && typeof payload === 'object' && payload !== null)
        ? payload as Record<string, unknown>
        : {};
      const payloadError = typeof payloadObj.error === 'string' ? payloadObj.error : '';
      const payloadMessage = typeof payloadObj.message === 'string' ? payloadObj.message : '';

      if (!res.ok) {
        throw new Error(
          payloadError ||
          payloadMessage ||
          `Request failed with status ${res.status}`
        );
      }

      // Handle different response structures:
      // Support array response or object with a "data" key, or any other array-valued key as fallback
      const dataKey = Array.isArray(payload)
        ? null
        : Object.keys(payloadObj).find((k) => Array.isArray(payloadObj[k]));
      const rows = Array.isArray(payload)
        ? payload
        : (dataKey ? (payloadObj[dataKey] as RowData[]) : []);
      const pages = typeof payloadObj.totalPages === 'number' ? payloadObj.totalPages : 1;
      setData(rows);
      setTotalPages(pages);
    } catch (err: unknown) {
      console.error('ServerGrid fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data from server.');
    } finally {
      setLoading(false);
    }
  }, [path, currentPage, query, setData, setTotalPages, setLoading, setError, getApiBase]);
  return fetchData;
}

export function useServerPost(
  path: string,
  fetchData: () => Promise<void>,
  setIsAdding: React.Dispatch<React.SetStateAction<boolean>>,
  transformAddPayload: ((payload: Record<string, unknown>, context: { path: string }) => Record<string, unknown>) | undefined,
  onNotify: (message: string, type: 'success' | 'error') => void,
  getApiBase: () => string) {
  const handleAddRow = async (newRowData: Record<string, unknown>) => {
    if (!path) return;

    try {
      let addUrl = path.includes('?') ? path.slice(0, path.indexOf('?')) : path;
      // Ensure /api/ prefix if not present
      if (!addUrl.startsWith('/api/')) {
        const cleanPath = addUrl.startsWith('/') ? addUrl.slice(1) : addUrl;
        addUrl = `/api/${cleanPath}`;
      }

      // Prepare payload - exclude technical fields
      let payload = { ...newRowData };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      payload = typeof transformAddPayload === 'function' ? transformAddPayload(payload, { path }) : payload;

      const res = await fetch(getApiBase() + addUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = 'Failed to add item';
        try {
          const errorData = await res.json();
          msg = errorData.error || errorData.message || msg;
        } catch (_) {
          // ignore json parse error
        }
        throw new Error(msg);
      }

      // Refresh data after successful addition
      await fetchData();
      setIsAdding(false);
      onNotify('Item added successfully!', 'success');
    } catch (err: unknown) {
      console.error('Add error:', err);
      onNotify(err instanceof Error ? err.message : 'Failed to add item', 'error');
    }
  };

  return handleAddRow;
}

export function useServerDelete(
  path: string, fetchData: () => Promise<void>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  showNot: (message: string, type: "error" | "success") => void,
  getApiBase: () => string) {

  const performDelete = async (row: Record<string, unknown>) => {
    if (!row.id) return;
    try {
      const basePath = path.includes('?') ? path.slice(0, path.indexOf('?')) : path;
      let deleteUrl = `${basePath}/${row.id}`;
      // Ensure /api/ prefix if not present; avoid accidental double slashes
      if (!deleteUrl.startsWith('/api/')) {
        // Remove leading slash if present to avoid double slashes
        const cleanPath = deleteUrl.startsWith('/') ? deleteUrl.slice(1) : deleteUrl;
        deleteUrl = `/api/${cleanPath}`;
      }

      const res = await fetch(getApiBase() + deleteUrl, {
        method: 'DELETE',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      });

      // Try to parse response as JSON, but handle HTML/plain text errors
      let responseData: Record<string, unknown> = {};
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        try {
          responseData = await res.json();
        } catch (e) {
          // If JSON parse fails, use empty object
        }
      }

      if (!res.ok) {
        const errorMessage = String(responseData.error || responseData.message || `Delete failed with status ${res.status}`);
        showNot(errorMessage, 'error');
        throw new Error(errorMessage);
      }

      // Refresh data after successful deletion
      await fetchData();
    } catch (err: unknown) {
      console.error('Delete error:', err);
      setError(`Failed to delete item: ${err instanceof Error ? err.message : ''}`);
    }
  };
  return performDelete;
}