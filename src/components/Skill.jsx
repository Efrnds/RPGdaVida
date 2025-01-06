import { PropTypes } from "prop-types";

export default function Skill({ title, xp, lvl }) {
  return (
    <div className="flex flex-col gap-2 p-1 border rounded-md shadow-md">
      <div className="flex flex-wrap justify-between w-1/2">
        <p className="text-sm text-left text-grayMd ">{title}</p>
      </div>
      <div className="flex justify-between w-full gap-2 ">
        <div className="relative flex-1 h-1.5 my-auto rounded-full bg-graySm">
          <div className="absolute w-2/5 h-1.5 rounded-full bg-primary"></div>
        </div>
        <div className="flex gap-2 my-auto w-fit">
          <p className="my-auto text-xs font-medium">{xp} xp</p>
          <p className="my-auto text-xs font-medium">&bull;</p>
          <p className="my-auto text-xs">{lvl}</p>
        </div>
      </div>
    </div>
  );
}

Skill.propTypes = {
  key: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  xp: PropTypes.string.isRequired,
  lvl: PropTypes.string.isRequired,
};
