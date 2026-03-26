import { PropTypes } from "prop-types";
import Link from "next/link";

export default function Option({ imgPath, text, href }) {
  return (
    <Link
      href={href || "/home"}
      className="group flex flex-col p-2 md:p-3 bg-white border rounded-md shadow-sm grid-span-1 aspect-[1/0.95] md:aspect-square border-graySm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow"
    >
      <img
        src={imgPath}
        alt=""
        className="m-auto h-16 md:h-28 transition-transform duration-150 group-hover:scale-[1.02]"
      />
      <p className="text-[11px] md:text-sm font-semibold leading-tight text-center text-grayMd">
        {text}
      </p>
    </Link>
  );
}

Option.propTypes = {
  imgPath: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  href: PropTypes.string,
};
