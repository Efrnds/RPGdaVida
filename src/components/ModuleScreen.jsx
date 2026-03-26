import Link from "next/link";
import PropTypes from "prop-types";
import { FaInfoCircle } from "react-icons/fa";

export default function ModuleScreen({
  title,
  subtitle,
  description,
  icon,
  maxWidth = "max-w-5xl",
  children,
}) {
  return (
    <main className="min-h-screen px-3 pt-3 pb-24 space-y-4 text-grayMd bg-zinc-100 md:px-4 md:pt-4 md:space-y-6 md:pb-6">
      <header className={`${maxWidth} mx-auto pb-4 border-b-2 border-graySm`}>
        <div className="flex items-center justify-between gap-2 md:gap-3">
          <h1 className="text-[28px] font-bold md:text-5xl">{title}</h1>
          <Link href="/home" className="text-sm underline text-grayMd">
            Voltar
          </Link>
        </div>
      </header>

      <section className={`${maxWidth} mx-auto pb-6 border-b-2 border-graySm`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-center">
          <article className="grid w-32 h-28 border rounded-sm border-graySm place-items-center bg-zinc-100 md:w-52 md:h-44">
            <span className="text-5xl md:text-7xl" aria-hidden="true">
              {icon}
            </span>
          </article>

          <article className="pt-1 md:pt-3">
            <h2 className="text-2xl font-bold text-black md:text-4xl">
              {subtitle}
            </h2>
            <p className="text-sm">{description}</p>
            <p className="flex items-center gap-1 mt-1 text-[13px] underline">
              <FaInfoCircle /> Precisa de ajuda
            </p>
          </article>
        </div>

        <div className="grid grid-cols-1 gap-2 mt-4 text-xs sm:grid-cols-3">
          <div className="p-2 border rounded-md border-graySm bg-white/70">
            <p className="font-semibold">➕ Criar</p>
            <p className="text-grayMd">
              Use os botões de novo item para registrar dados.
            </p>
          </div>
          <div className="p-2 border rounded-md border-graySm bg-white/70">
            <p className="font-semibold">✏️ Editar</p>
            <p className="text-grayMd">
              Abra um card/item para ajustar os campos.
            </p>
          </div>
          <div className="p-2 border rounded-md border-graySm bg-white/70">
            <p className="font-semibold">💾 Salvar</p>
            <p className="text-grayMd">
              Confirme as mudanças para não perder progresso.
            </p>
          </div>
        </div>
      </section>

      <section className={`${maxWidth} mx-auto space-y-3`}>{children}</section>
    </main>
  );
}

ModuleScreen.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  maxWidth: PropTypes.string,
  children: PropTypes.node.isRequired,
};
