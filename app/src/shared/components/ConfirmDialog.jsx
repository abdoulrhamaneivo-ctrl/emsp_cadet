import Modal from "./Modal";
import Button from "./Button";

/**
 * ConfirmDialog (doc 03 §6.12) — wrapper Modal avec paire Annuler/Confirmer.
 * @param {"default"|"danger"} tone="default"
 * @param {boolean} loading — état du bouton de confirmation
 */
export default function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  tone = "default",
  onConfirm,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="xs"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </Modal>
  );
}
