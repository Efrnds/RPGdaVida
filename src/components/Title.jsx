import { PropTypes } from "prop-types";

export default function Title({ title }) {
  return (
    <div>
      <h2 className="text-[32px] font-semibold leading-none text-grayMd">{title}</h2>
      <hr className="mt-1 border-graySm" />
    </div>
  );
}

Title.propTypes = {
  title: PropTypes.string.isRequired,
};
