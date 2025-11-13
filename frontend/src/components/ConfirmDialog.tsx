"use client";

import { ReactNode } from "react";
import Modal from "@/src/components/Modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirming?: boolean;
  icon?: ReactNode;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  confirming = false,
  icon,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            disabled={confirming}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={confirming}
          >
            {confirming ? "Eliminando..." : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4 text-gray-700">
        {icon ? <div className="text-2xl text-red-500">{icon}</div> : null}
        <div className="space-y-2 text-sm">
          <p>
            Esta acción no se puede deshacer. El producto será eliminado de forma
            permanente.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

