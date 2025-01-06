import { PropTypes } from "prop-types";
export default function Task({ today, title, level, status }) {
  return (
    <div className="flex justify-between text-sm">
      <div className="flex gap-2">
        {today}
        <h1>{title}</h1>
      </div>
      <div className="flex gap-2 my-auto text-xs h-fit">
        <p className="px-1 rounded-sm bg-graySm text-grayMd">{level}</p>
        <p className="px-1 font-semibold border rounded-sm border-graySm text-grayMd">{status}</p>
      </div>
    </div>
  );
}

Task.propTypes = {
  today: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  level: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
};
