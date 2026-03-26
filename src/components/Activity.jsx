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
    const icon =
      lostOrWon === "won" ? "➡️" : lostOrWon === "lost" ? "➡️" : "❎";
    const valuesClass = lostOrWon === "won" ? "text-primary" : "text-red-500";

    return (
      <div className="flex flex-col gap-1.5 p-3 mb-2 border border-graySm/60 rounded-md bg-white shadow-sm transition-shadow hover:shadow">
        <div className="flex items-center gap-1.5 opacity-80">
          <span className="text-[12px]">{icon}</span>
          <p className="text-[11px] font-medium text-grayMd/90 truncate">
            {topLabel}
          </p>
        </div>
        <p className="text-[12px] md:text-[13px] leading-snug text-black">
          {desc}
        </p>
        {values ? (
          <p
            className={`text-[11px] md:text-[12px] font-bold ${valuesClass} mt-0.5`}
          >
            {values}
          </p>
        ) : null}
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
