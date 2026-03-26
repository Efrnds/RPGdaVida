import { PropTypes } from "prop-types";

export default function Activity({
  title,
  lostOrWon,
  values,
  desc,
  compact = false,
  onDelete,
  onToggleStatus,
}) {
  if (compact) {
    const topLabel = title || "Atividade";
    const icon = lostOrWon === "won" ? "✅" : lostOrWon === "lost" ? "❌" : "☑️";
    const valuesClass = lostOrWon === "won" ? "text-primary" : "text-red-500";

    return (
      <div className="p-2 border rounded-md border-graySm bg-white">
        <p className="text-xs font-medium text-grayMd">{icon} {topLabel}</p>
        <p className="text-xs leading-4 text-grayMd">{desc}</p>
        {values ? <p className={`text-sm font-semibold ${valuesClass}`}>{values}</p> : null}
      </div>
    );
  }

  if (lostOrWon === "won") {
    return (
      <div className="flex flex-col gap-2 p-1 text-sm border rounded-md shadow-md border-graySm">
        <p>➡️ {title || "Atividade"}</p>
        <p className="text-xs">{desc}</p>
        {values ? <p className="text-primary">{values}</p> : null}
        <div className="flex gap-2">
          <button
            onClick={onToggleStatus}
            className="px-2 py-1 text-xs rounded-md bg-graySm text-grayMd"
          >
            Alterar status
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs text-white bg-red-500 rounded-md"
          >
            Excluir
          </button>
        </div>
      </div>
    );
  } else if (lostOrWon === "lost") {
    return (
      <div className="flex flex-col gap-2 p-1 text-sm border rounded-md shadow-md border-graySm">
        <p>➡️ {title || "Atividade"}</p>
        <p className="text-xs">{desc}</p>
        {values ? <p className="text-red-500">{values}</p> : null}
        <div className="flex gap-2">
          <button
            onClick={onToggleStatus}
            className="px-2 py-1 text-xs rounded-md bg-graySm text-grayMd"
          >
            Alterar status
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs text-white bg-red-500 rounded-md"
          >
            Excluir
          </button>
        </div>
      </div>
    );
  } else if (lostOrWon === "limit") {
    return (
      <div className="flex flex-col gap-2 p-1 text-sm border rounded-md shadow-md border-graySm">
        <p>❎ Verificação de Estouro de Limite Especial</p>
        <p className="text-xs">{desc}</p>
        <div className="flex gap-2">
          <button
            onClick={onToggleStatus}
            className="px-2 py-1 text-xs rounded-md bg-graySm text-grayMd"
          >
            Alterar status
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs text-white bg-red-500 rounded-md"
          >
            Excluir
          </button>
        </div>
      </div>
    );
  }

  return null;
}

Activity.propTypes = {
  title: PropTypes.string,
  lostOrWon: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  values: PropTypes.string,
  compact: PropTypes.bool,
  onDelete: PropTypes.func,
  onToggleStatus: PropTypes.func,
};
