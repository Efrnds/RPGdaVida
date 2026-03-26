import { PropTypes } from "prop-types";

export default function FormModal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <div className="w-full max-w-lg p-4 space-y-3 bg-white border rounded-md shadow-xl border-graySm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-grayMd">{title}</h2>
            <p className="text-xs text-grayMd">Preencha os campos e confirme para salvar.</p>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs border rounded-md border-graySm text-grayMd hover:bg-zinc-50"
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

FormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};
