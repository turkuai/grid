import React, { useState } from 'react';
import { ServerGrid as ServerGridBase } from 'tai-grid';
import 'tai-grid/style.css';
import PlusButton from './PlusButton';
import type { RelationDialogProps } from './RelationDialog';
import RelationDialog from './RelationDialog';

const ServerGrid = ServerGridBase as React.ComponentType<any>;

type RelationGridProps = {
  columns: any[];
  path: string;
  addTitle: string;
  dialogConfig: Omit<RelationDialogProps, 'getApiBase' | 'onClose'>;

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
  addTitle,
  dialogConfig,
  loading = false,
  refreshKey = 0,
  allowDelete = false,
  pageSize = 10,
  query,
  getApiBase,
  showNot,
  labels,
}: RelationGridProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [localRefreshKey, setLocalRefreshKey] = useState(0);

  const handleRecordsAdded = () => {
    setLocalRefreshKey((previous) => previous + 1);
    dialogConfig.onAdded?.();
  };

  return (
    <div className="relation-grid">
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '1rem',
        }}
      >
        <PlusButton title={addTitle} onClick={() => setShowAddModal(true)} />
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : (
        <ServerGrid
          key={`${refreshKey}-${localRefreshKey}`}
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

      {showAddModal && (
        <RelationDialog {...dialogConfig} getApiBase={getApiBase} onClose={() => setShowAddModal(false)} onAdded={handleRecordsAdded} />
      )}
    </div>
  );
}
