import { Plus } from 'lucide-react';
import React from 'react';
import { ServerGrid as ServerGridBase } from 'tai-grid';
import 'tai-grid/style.css';

const ServerGrid = ServerGridBase as React.ComponentType<any>;

type RelationGridProps = {
  columns: any[];
  path: string;
  onAdd: () => void;
  addTitle: string;
  loading?: boolean;
  refreshKey?: string | number;
  allowDelete?: boolean;
  pageSize?: number;
  query?: string;
  getApiBase: () => string;
  showNot: (...args: any[]) => void;
  labels?: any;
  emptyMessage?: string;
};

export default function RelationGrid({
  columns,
  path,
  onAdd,
  addTitle,
  loading = false,
  refreshKey = 0,
  allowDelete = false,
  pageSize = 10,
  query,
  getApiBase,
  showNot,
  labels,
  emptyMessage,
}: RelationGridProps) {
  return (
    <div className="relation-grid">
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '1rem',
        }}
      >
        <button type="button" className="server-grid-add-button" title={addTitle} aria-label={addTitle} onClick={onAdd}>
          <Plus size={20} />
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : (
        <ServerGrid
          key={refreshKey}
          columns={columns}
          path={path}
          allowEditing={false}
          allowDelete={allowDelete}
          pageSize={pageSize}
          query={query}
          showAddButton={false}
          getApiBase={getApiBase}
          showNot={showNot}
          labels={labels}
        />
      )}
    </div>
  );
}
