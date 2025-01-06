import { PropTypes } from "prop-types";

export default function Heart({ vidaTotal }) {
  const hearts = [];
  const vidaAtual = vidaTotal - 200;
  for (let i = 0; i < vidaTotal / 100; i++) {
    if (i < vidaAtual / 100) {
      hearts.push("🖤");
    } else {
      hearts.push("🤍");
    }
  }
  return (
    <div>
      <h2>
        HP: {hearts} {vidaAtual}/{vidaTotal}
      </h2>
    </div>
  );
}

Heart.propTypes = {
  vidaTotal: PropTypes.number.isRequired,
};
