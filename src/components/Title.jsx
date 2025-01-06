import { PropTypes } from "prop-types";

export default function Title({ title }) {
  return (
    <div>
      <h1>{title}</h1>
      <hr />
    </div>
  );
}

Title.propTypes = {
  title: PropTypes.string.isRequired,
};
