import React, { useState } from 'react';
import { ServerGrid as ServerGridBase } from 'tai-grid';
import 'tai-grid/style.css';
import PlusButton from './PlusButton';
import RelationDialog, { RelationDialogProps } from './RelationDialog';
const ServerGrid = ServerGridBase as React.ComponentType<any>;

type RowData = Record<string, any>;

type RelationGridProps = {
  columns: any[];
  path: string;
  addTitle: string;
  addModal: RelationDialogProps;

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
  addModal,
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
    addModal.onAdded?.();
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
        <RelationDialog
          title={addModal.title}
          heading={addModal.heading}
          searchPlaceholder={addModal.searchPlaceholder}
          cancelLabel={addModal.cancelLabel}
          fetchUrl={addModal.fetchUrl}
          addUrl={addModal.addUrl}
          entityLabel={addModal.entityLabel}
          entityLabelPlural={addModal.entityLabelPlural}
          getApiBase={getApiBase}
          getRecordId={addModal.getRecordId}
          getRecords={addModal.getRecords}
          renderRecord={addModal.renderRecord}
          onClose={() => setShowAddModal(false)}
          onAdded={handleRecordsAdded}
        />
      )}
    </div>
  );
}
