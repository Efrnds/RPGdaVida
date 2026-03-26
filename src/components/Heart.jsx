import { PropTypes } from "prop-types";

export default function Heart({ vidaTotal, vidaAtual }) {
  const hearts = [];

  const current = Math.max(0, Math.min(vidaAtual, vidaTotal));
  for (let i = 0; i < vidaTotal / 100; i++) {
    if (i < current / 100) {
      hearts.push("🖤");
    } else {
      hearts.push("🤍");
    }
  }
  return (
    <div>
      <h2>
        HP: {hearts} {current}/{vidaTotal}
      </h2>
    </div>
  );
}

Heart.propTypes = {
  vidaTotal: PropTypes.number.isRequired,
  vidaAtual: PropTypes.number.isRequired,
};
