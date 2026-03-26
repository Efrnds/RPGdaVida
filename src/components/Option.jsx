import { PropTypes } from "prop-types";
import Link from "next/link";

export default function Option({ imgPath, text, href }) {
  return (
    <Link
      href={href || "/home"}
      className="group flex flex-col items-center bg-white border border-graySm rounded shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] aspect-square transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md p-4"
    >
      <div className="flex-1 flex items-center justify-center w-full">
        <img
          src={imgPath}
          alt=""
          className="h-16 md:h-24 w-auto object-contain transition-transform duration-150 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-2 text-[11px] md:text-sm font-bold text-center text-grayMd">
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
