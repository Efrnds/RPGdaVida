import { PropTypes } from "prop-types";
export default function Option({ imgPath, text }) {
  return (
    <div className="flex flex-col p-2 border rounded-md shadow-md grid-span-1 aspect-square border-graySm">
      <img src={imgPath} alt="" className="m-auto h-24"/>
      <p className="text-sm font-medium text-center text-grayMd">{text}</p>
    </div>
  );
}

Option.propTypes = {
  imgPath: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};
