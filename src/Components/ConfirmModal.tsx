import { useEffect, useRef } from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "OK",
  cancelText = "Annuleren",
  isConfirming,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => cancelButtonRef.current?.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!open) return;
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="modal-card" onMouseDown={(event) => event.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        {description ? <p className="modal-description">{description}</p> : null}

        <div className="modal-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="button-secondary"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="button-danger"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Bezig..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

