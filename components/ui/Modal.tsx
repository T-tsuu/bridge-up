// components/ui/Modal.tsx
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional description rendered below the title */
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Max width class — defaults to max-w-lg */
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-lg",
}: ModalProps) {
  const t = useTranslations("ui");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]);

  // Sync native close (Escape key) with React state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      className={cn(
        "m-auto w-full rounded-xl bg-card-white shadow-2xl p-0 backdrop:bg-bridge-blue/50 backdrop:backdrop-blur-sm",
        "open:flex open:flex-col",
        maxWidth
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-text/8">
        <div>
          <h2 id="modal-title" className="font-heading font-semibold text-lg text-dark-text">
            {title}
          </h2>
          {description && (
            <p id="modal-description" className="text-sm font-body text-dark-text/60 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("modal.close")}
          className="rounded-lg p-1.5 text-dark-text/60 hover:text-dark-text hover:bg-page-bg transition-colors"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 font-body text-dark-text overflow-y-auto">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-dark-text/8 flex items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </dialog>
  );
}