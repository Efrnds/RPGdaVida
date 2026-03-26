import { PropTypes } from "prop-types";
export default function Task({
  today,
  title,
  level,
  status,
  compact = false,
  onToggleStatus,
  onDelete,
}) {
  if (compact) {
    return (
      <div className="flex items-start justify-between gap-2 py-1.5 text-[13px] md:text-sm border-b border-graySm/40 last:border-b-0 pb-2">
        <div className="flex items-start gap-1.5 overflow-hidden flex-1 leading-snug">
          {today ? (
            <span className="text-grayMd/80 whitespace-nowrap">⏱️ {today}</span>
          ) : null}
          <h1 className="text-black">{title}</h1>
        </div>
        <div className="flex items-center gap-1.5 h-fit shrink-0 mt-0.5">
          <p className="px-1.5 py-0.5 rounded-[4px] bg-graySm/60 text-[9px] md:text-[10px] font-bold text-grayMd uppercase tracking-wide">
            Level {level}
          </p>
          <button
            onClick={onToggleStatus}
            className="px-1.5 py-0.5 border rounded-[4px] border-graySm text-[9px] md:text-[10px] font-bold text-grayMd uppercase tracking-wide bg-white hover:bg-gray-50 transition-colors"
          >
            {status}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between text-sm">
      <div className="flex gap-2">
        {today ? <p className="font-bold text-grayMd">{today}</p> : null}
        <h1>{title}</h1>
      </div>
      <div className="flex gap-2 my-auto text-xs h-fit">
        <p className="px-1 rounded-sm bg-graySm text-grayMd">Level {level}</p>
        <button
          onClick={onToggleStatus}
          className="px-1 font-semibold border rounded-sm border-graySm text-grayMd"
        >
          {status}
        </button>
        <button
          onClick={onDelete}
          className="px-1 font-semibold text-white bg-red-500 rounded-sm"
        >
          X
        </button>
      </div>
    </div>
  );
}

Task.propTypes = {
  today: PropTypes.string,
  title: PropTypes.string.isRequired,
  level: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  compact: PropTypes.bool,
  onToggleStatus: PropTypes.func,
  onDelete: PropTypes.func,
};
