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
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-1 overflow-hidden">
          {today ? <p className="font-bold text-grayMd">🕛</p> : null}
          <h1 className="truncate">{title}</h1>
        </div>
        <div className="flex gap-1 text-[10px] h-fit">
          <p className="px-1 rounded-sm bg-graySm text-grayMd">Level {level}</p>
          <p className="px-1 font-semibold border rounded-sm border-graySm text-grayMd">
            {status}
          </p>
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
