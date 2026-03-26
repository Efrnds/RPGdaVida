import Link from "next/link";
import PropTypes from "prop-types";
import { FaInfoCircle } from "react-icons/fa";

export default function ModuleScreen({
  title,
  subtitle,
  description,
  icon,
  maxWidth = "max-w-[1200px]",
  children,
}) {
  return (
    <main
      className={`min-h-screen px-4 pb-24 md:px-8 md:pb-12 text-grayMd bg-[#f8f9fa]`}
    >
      <header
        className={`${maxWidth} mx-auto pt-6 pb-6 border-b-2 border-graySm/50`}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-xs font-semibold uppercase tracking-wider text-grayMd bg-white border border-graySm rounded hover:bg-zinc-50 transition-colors"
            >
              ← Voltar ao Início
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">
              {title}
            </h1>
          </div>
        </div>
      </header>

      <section
        className={`${maxWidth} mx-auto pt-8 pb-10 border-b-2 border-graySm/50`}
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          <article className="grid shrink-0 w-32 h-32 md:w-48 md:h-48 border-2 rounded-2xl border-graySm/40 bg-white shadow-sm place-items-center text-[60px] md:text-[80px]">
            {icon}
          </article>

          <article className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-3">
              {subtitle}
            </h2>
            <p className="text-base text-grayMd leading-relaxed mb-4">
              {description}
            </p>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-grayMd bg-white border border-graySm rounded hover:bg-zinc-50 transition-colors">
              <FaInfoCircle /> Precisa de ajuda
            </button>
          </article>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-3">
          <div className="p-4 bg-white border border-graySm/40 rounded-xl shadow-sm transition-shadow hover:shadow-md">
            <p className="font-bold text-black text-[15px] mb-1 flex items-center gap-2">
              <span>➕</span> Criar novo
            </p>
            <p className="text-sm text-grayMd/80">
              Use os botões de novo item para registrar dados ao módulo.
            </p>
          </div>
          <div className="p-4 bg-white border border-graySm/40 rounded-xl shadow-sm transition-shadow hover:shadow-md">
            <p className="font-bold text-black text-[15px] mb-1 flex items-center gap-2">
              <span>✏️</span> Editar item
            </p>
            <p className="text-sm text-grayMd/80">
              Abra um card/item salvo na lista para ajustar os campos.
            </p>
          </div>
          <div className="p-4 bg-white border border-graySm/40 rounded-xl shadow-sm transition-shadow hover:shadow-md">
            <p className="font-bold text-black text-[15px] mb-1 flex items-center gap-2">
              <span>💾</span> Progresso seguro
            </p>
            <p className="text-sm text-grayMd/80">
              Confirme sempre as mudanças no final para não perder os dados.
            </p>
          </div>
        </div>
      </section>

      <section className={`${maxWidth} mx-auto pt-10 space-y-6 md:space-y-10`}>
        {children}
      </section>
    </main>
  );
}

ModuleScreen.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  maxWidth: PropTypes.string,
  children: PropTypes.node.isRequired,
};
