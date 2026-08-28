import React from 'react';

export type DialogLabels = {
  title?: string;
  save?: string;
  cancel?: string;
  close?: string;
};

const defaultDialogLabels: Required<DialogLabels> = {
  title: 'Add',
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
};

type ServerGridEditDialogProp = {
  formComponent: React.ReactNode;
  isEditing?: boolean;
  onCancel: () => void;
  onSave: () => void;
  labels?: DialogLabels;
};
export default function ServerGridEditDialog({
  formComponent,
  isEditing = false,
  onCancel,
  onSave,
  labels = {},
}: ServerGridEditDialogProp): React.JSX.Element {
  const title = labels.title ?? (isEditing ? 'Edit' : defaultDialogLabels.title);
  const cancelLabel = labels.cancel ?? defaultDialogLabels.cancel;
  const saveLabel = labels.save ?? defaultDialogLabels.save;
  const closeLabel = labels.close ?? defaultDialogLabels.close;
  const handleSave = () => onSave();
  const handleCancel = () => onCancel();

  return (
    <div className="sg-modal-overlay" onClick={handleCancel}>
      <div className="sg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <button onClick={handleCancel} className="sg-modal-close" aria-label={closeLabel}>
          ×
        </button>

        <h2 className="sg-modal-title">{title}</h2>

        {formComponent}

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <button type="button" className="sg-modal-cancel-btn" style={{ backgroundColor: '#111827' }} onClick={handleCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="sg-modal-save-btn" style={{ backgroundColor: '#22c55e' }} onClick={handleSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
