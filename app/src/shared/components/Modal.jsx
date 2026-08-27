import { forwardRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cx } from "@shared/utils/cx";

/** Transition maison fade + scale 0.96 → 1, 180 ms ease-out (doc 03 §6.6). */
const TransitionAnimation = forwardRef(function TransitionAnimation(props, ref) {
  const { children, ...autres } = props;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      {...autres}
    >
      {children}
    </motion.div>
  );
});

/**
 * Modal (doc 03 §6.6) — wrapper MUI Dialog habillé tokens (thème global).
 * @param {boolean} open @param {function} onClose
 * @param {string} title @param {string} subtitle
 * @param {"xs"|"sm"|"md"|"lg"} maxWidth="sm"
 * @param {React.ReactNode} actions — boutons du pied de modale
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = "sm",
  actions,
  className,
  children,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      TransitionComponent={TransitionAnimation}
      aria-labelledby="modal-titre"
    >
      <DialogTitle
        id="modal-titre"
        component="h2"
        className={cx("flex items-start justify-between gap-4 pr-4 text-xl font-bold text-[var(--text-primary)]", className)}
      >
        <span>{title}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="mt-0.5 rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)]"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
        {children}
        {actions && <div className="flex justify-end gap-3 pt-2">{actions}</div>}
      </DialogContent>
    </Dialog>
  );
}
