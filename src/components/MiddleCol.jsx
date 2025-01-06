import Option from "../components/Option.jsx";
export default function MiddleCol() {
  const optionsMap = [
    {
      title: "Crescimento - Bom hábito",
      imgPath: "/assets/images/Crescimento.svg",
    },
    {
      title: "Batalha - Mau hábito",
      imgPath: "/assets/images/Batalha.svg",
    },
    {
      title: "Metas - Conquistas",
      imgPath: "/assets/images/Metas.svg",
    },
    {
      title: "Estágio - Método PARA",
      imgPath: "/assets/images/Estagio.svg",
    },
    {
      title: "Mercado - Recompensas",
      imgPath: "/assets/images/Mercado.svg",
    },
    {
      title: "Log de Atividades - Diário",
      imgPath: "/assets/images/Log.svg",
    },
    {
      title: "Configurações",
      imgPath: "/assets/images/Config.svg",
    },
    {
      title: "Perfil - Visão de metas",
      imgPath: "/assets/images/Perfil.svg",
    },
    {
        title: "Finanças - Investimentos",
        imgPath: "/assets/images/Financas.svg",
    }
  ];
  return (
    <section className="flex-1 p-4">
      <div className="flex justify-around w-full gap-0 px-8 drop-shadow-md">
        <div className="flex-1 h-px my-auto border border-grayMd"></div>
        <div className="mx-auto w-fit">
          <h1 className="p-2 text-xl font-bold border-2 rounded-md border-grayMd text-grayMd">
            Bem vindo ao RPG da Vida
          </h1>
        </div>
        <div className="flex-1 h-px my-auto border border-grayMd"></div>
      </div>
      <div className="grid grid-cols-3 grid-rows-3 gap-4 py-4 h-fit">
        {optionsMap.map((option) => (
          <Option
            key={option.title}
            text={option.title}
            imgPath={option.imgPath}
          />
        ))}
      </div>
    </section>
  );
}
