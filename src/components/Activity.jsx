import { PropTypes } from "prop-types";

export default function Activity({ title, lostOrWon, values, desc }) {
  if (lostOrWon === "won") {
    return (
      <div className="flex flex-col gap-2 p-1 text-sm border rounded-md shadow-md border-graySm">
        <p>➡️ {title}</p>
        <p className="text-xs">{desc}</p>
        <p className="text-primary">{values}</p>
      </div>
    );
  } else if (lostOrWon === "lost") {
    return (
      <div className="flex flex-col gap-2 p-1 text-sm border rounded-md shadow-md border-graySm">
        <p>➡️ {title}</p>
        <p className="text-xs">{desc}</p>
        <p className="text-red-500">{values}</p>
      </div>
    );
  } else if (lostOrWon === "limit") {
    return (
      <div className="flex flex-col gap-2 p-1 text-sm border rounded-md shadow-md border-graySm">
        <p>❎ Verificação de Estouro de Limite Especial</p>
        <p className="text-xs">{desc}</p>
      </div>
    );
  }
}
Activity.propTypes = {
  title: PropTypes.string.isRequired,
  lostOrWon: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  values: PropTypes.string.isRequired,
};
