import { PropTypes } from "prop-types";

export default function Skill({
  title,
  xp,
  lvl,
  progressPercent,
  compact = false,
  onDelete,
  onLevelUp,
  onGainXp,
  onGainBigXp,
}) {
  if (compact) {
    return (
      <div className="p-2 border rounded-md border-graySm bg-white">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-grayMd">{title}</p>
          <p className="text-[11px] font-semibold tracking-tight text-grayMd">
            {xp} xp • {lvl.replace("Nível", "lvl")}
          </p>
        </div>
        <div className="relative w-full h-1.5 mt-1.5 rounded-full bg-graySm">
          <div
            className="absolute h-1.5 rounded-full bg-primary"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-1 border rounded-md shadow-md">
      <div className="flex flex-wrap justify-between w-1/2">
        <p className="text-sm text-left text-grayMd ">{title}</p>
      </div>
      <div className="flex justify-between w-full gap-2 ">
        <div className="relative flex-1 h-1.5 my-auto rounded-full bg-graySm">
          <div
            className="absolute h-1.5 rounded-full bg-primary"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex gap-2 my-auto w-fit">
          <p className="my-auto text-xs font-medium">{xp} xp</p>
          <p className="my-auto text-xs font-medium">&bull;</p>
          <p className="my-auto text-xs">{lvl}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onGainXp}
          className="px-2 py-1 text-xs rounded-md bg-graySm text-grayMd"
        >
          +5 XP
        </button>
        <button
          onClick={onGainBigXp}
          className="px-2 py-1 text-xs rounded-md bg-graySm text-grayMd"
        >
          +20 XP
        </button>
        <button
          onClick={onLevelUp}
          className="px-2 py-1 text-xs rounded-md bg-graySm text-grayMd"
        >
          +1 Nível
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

Skill.propTypes = {
  title: PropTypes.string.isRequired,
  xp: PropTypes.string.isRequired,
  lvl: PropTypes.string.isRequired,
  progressPercent: PropTypes.number.isRequired,
  compact: PropTypes.bool,
  onDelete: PropTypes.func,
  onLevelUp: PropTypes.func,
  onGainXp: PropTypes.func,
  onGainBigXp: PropTypes.func,
};
