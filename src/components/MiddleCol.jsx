import Option from "../components/Option.jsx";
export default function MiddleCol() {
  const optionsMap = [
    {
      title: "Crescimento - Bom hábito",
      imgPath: "/assets/images/Crescimento.svg",
      href: "/home/bom-habito",
    },
    {
      title: "Batalha - Mau hábito",
      imgPath: "/assets/images/Batalha.svg",
      href: "/home/mau-habito",
    },
    {
      title: "Metas - Conquistas",
      imgPath: "/assets/images/Metas.svg",
      href: "/home/metas-conquistas",
    },
    {
      title: "Estágio - Método PARA",
      imgPath: "/assets/images/Estagio.svg",
      href: "/home/estagio-para",
    },
    {
      title: "Mercado - Recompensas",
      imgPath: "/assets/images/Mercado.svg",
      href: "/home/dinheiro",
    },
    {
      title: "Log de Atividades - Diário",
      imgPath: "/assets/images/Log.svg",
      href: "/home/diario",
    },
    {
      title: "Configurações",
      imgPath: "/assets/images/Config.svg",
      href: "/home/configuracoes",
    },
    {
      title: "Perfil - Visão de metas",
      imgPath: "/assets/images/Perfil.svg",
      href: "/home/perfil-metas",
    },
    {
      title: "Finanças",
      imgPath: "/assets/images/Financas.svg",
      href: "/home/financas-investimentos",
    },
  ];
  return (
    <section className="flex-1 p-0 xl:w-[49%]">
      <div className="relative flex items-center justify-center w-full mb-6">
        <div className="absolute inset-0 flex items-center px-4">
          <div className="w-full border-t-[3px] border-graySm"></div>
        </div>
        <div className="relative z-10 bg-white border border-graySm shadow-sm rounded">
          <h1 className="px-6 py-2.5 text-xl font-bold md:text-[26px] text-grayMd tracking-tight">
            Bem vindo ao RPG da Vida
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:gap-5 md:grid-cols-3 h-fit px-1">
        {optionsMap.map((option) => (
          <Option
            key={option.title}
            text={option.title}
            imgPath={option.imgPath}
            href={option.href}
          />
        ))}
      </div>
    </section>
  );
}
