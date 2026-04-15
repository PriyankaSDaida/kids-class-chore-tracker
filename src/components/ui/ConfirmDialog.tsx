// ─── Confirm Dialog ────────────────────────────────────────────────────────────
import React from 'react';

interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title, description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm, onCancel
}) => (
  <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
      <div className="confirm-panel">
        <div className="confirm-icon">{destructive ? '🗑️' : '❓'}</div>
        <h3 className="confirm-title">{title}</h3>
        {description && <p className="confirm-desc">{description}</p>}
        <div className="flex gap-3">
          <button className="btn btn-secondary w-full" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={`btn w-full ${destructive ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
