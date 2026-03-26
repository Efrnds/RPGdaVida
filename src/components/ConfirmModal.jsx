import { PropTypes } from "prop-types";

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md p-4 space-y-3 bg-white border rounded-md shadow-xl border-graySm">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-grayMd">{description}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm border rounded-md border-graySm hover:bg-zinc-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

ConfirmModal.defaultProps = {
  title: "Confirmar ação",
  description: "Tem certeza que deseja continuar?",
  confirmLabel: "Confirmar",
  cancelLabel: "Cancelar",
};
