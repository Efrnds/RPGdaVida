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
      title: "Finanças - Investimentos",
      imgPath: "/assets/images/Financas.svg",
      href: "/home/financas-investimentos",
    },
  ];
  return (
    <section className="flex-1 p-0 xl:w-[49%]">
      <div className="flex justify-around w-full gap-0 px-1 sm:px-6">
        <div className="flex-1 h-px my-auto border border-grayMd"></div>
        <div className="mx-auto w-fit">
          <h1 className="px-2 py-1.5 text-[22px] font-bold border-2 rounded-md md:px-3 md:py-2 md:text-[36px] border-grayMd text-grayMd tracking-tight">
            Bem vindo ao RPG da Vida
          </h1>
        </div>
        <div className="flex-1 h-px my-auto border border-grayMd"></div>
      </div>
      <div className="grid grid-cols-2 gap-2 py-3 md:gap-4 md:py-5 md:grid-cols-3 h-fit">
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
