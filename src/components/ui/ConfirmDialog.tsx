"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmDialogProps) {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
        {message}
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          {t("confirm.cancel")}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {t("confirm.delete")}
        </Button>
      </div>
    </Modal>
  );
}
