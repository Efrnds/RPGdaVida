import { PropTypes } from "prop-types";
import Title from "../components/Title.jsx";
import Skill from "../components/Skill.jsx";
import Heart from "../components/Heart.jsx";

export default function LeftCol({ username, level, coins }) {
  username = "John Doe";
  level = "Nível 1";
  coins = "120 Moedas";

  const mapSkills = [
    {
      title: "💡 Criatividade",
      xp: "1000 / 2000",
      lvl: "Nível 2",
      key: "💡 Criatividade",
    },
    {
      title: "💻 Programação",
      xp: "500 / 2000",
      lvl: "Nível 1",
      key: "Programação",
    },
    { title: "🍎 Saúde", xp: "1500 / 2000", lvl: "Nível 3", key: "Saúde" },
    {
      title: "📖 Aprendizado",
      xp: "2000 / 2000",
      lvl: "Nível 4",
      key: "Aprendizado",
    },
  ];
  return (
    <section className="flex flex-col w-1/4 gap-4">
      {/* Perfil */}
      <div className="flex flex-col gap-2 p-2 border rounded-md shadow-md">
        <img
          src="/assets/images/Profile-Icon.png"
          alt=""
          className="rounded-md"
        />
        {/*
              Nome nível e moedas
            */}
        <div className="flex flex-wrap w-full gap-2">
          <p>{username}</p>
          <p>&bull;</p>
          <p>{level}</p>
          <p>&bull;</p>
          <p>{coins}</p>
        </div>
        {/*
              Vida
            */}
        <Heart vidaTotal={1000} />
        {/*
              Objetivo principal
            */}
        <div>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left text-grayMd">
                Objetivo Principal
              </p>
              <p className="text-sm font-bold text-grayMd">:</p>
            </div>
            <p className="text-sm">Viajar pelo mundo</p>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left text-grayMd">
                Objetivo Secundário
              </p>
              <p className="text-sm font-bold text-grayMd">:</p>
            </div>
            <p className="text-sm">Ter Estabilidade Financeira</p>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left text-grayMd">
                Forças
              </p>
              <p className="text-sm font-bold text-grayMd">:</p>
            </div>
            <p className="text-sm">Autodidata</p>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left text-grayMd">
                Fraquezas
              </p>
              <p className="text-sm font-bold text-grayMd">:</p>
            </div>
            <p className="text-sm">Procrastinador</p>
          </div>
        </div>
        {/*
              Conclusão de metas
            */}
        <div>
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left ">Conclusão de metas</p>
              <p className="text-sm font-bold ">:</p>
            </div>
            <div className="flex w-full gap-4">
              <div className="relative w-full h-2 my-auto rounded-full bg-graySm">
                <div className="absolute w-2/5 h-2 rounded-full bg-primary"></div>
              </div>
              <p className="my-auto text-sm">40%</p>
            </div>
          </div>
        </div>
        {/*
              Experiência
            */}
        <div>
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left ">Experiência</p>
              <p className="text-sm font-bold ">:</p>
            </div>
            <div className="flex w-full gap-4">
              <div className="relative flex-1 h-2 my-auto rounded-full bg-graySm">
                <div className="absolute w-2/5 h-2 rounded-full bg-primary"></div>
              </div>
              <p className="my-auto text-sm">1000 / 2000 xp</p>
            </div>
          </div>
        </div>
      </div>
      {/* Skills */}
      <div className="flex flex-col gap-4 p-4">
        <Title title="⚔️ Skills" />
        {mapSkills.map((skill) => (
          <Skill
            title={skill.title}
            xp={skill.xp}
            lvl={skill.lvl}
            key={skill.key}
          />
        ))}
        <button className="text-sm border rounded-md text-grayMd border-graySm">
          Nova Skill +
        </button>
      </div>
    </section>
  );
}

LeftCol.propTypes = {
  username: PropTypes.string.isRequired,
  level: PropTypes.string.isRequired,
  coins: PropTypes.string.isRequired,
};
