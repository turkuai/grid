import type { ReactNode } from "react";
type ServerGridEditDialogProp = {
  formComponent: ReactNode;
  isEditing?: boolean;
  onCancel: () => void;
  onSave: () => void;
}
export default function ServerGridEditDialog({
  formComponent,
  isEditing = false,
  onCancel,
  onSave,
}: ServerGridEditDialogProp): React.JSX.Element {
  const title = isEditing ? "Edit" : "Add";

  const handleSave = () => onSave();
  const handleCancel = () => onCancel();

  return (
    <div className="sg-modal-overlay" onClick={handleCancel}>
      <div
        className="sg-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <button
          onClick={handleCancel}
          className="sg-modal-close"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="sg-modal-title">{title}</h2>

        {formComponent}

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="sg-modal-cancel-btn"
            style={{ backgroundColor: '#111827' }}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="sg-modal-save-btn"
            style={{ backgroundColor: '#22c55e' }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}