"use client";

import { useEffect, useState } from "react";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import * as runtime from "react/jsx-runtime";
import { PropTypes } from "prop-types";

export default function MdxPreview({ source }) {
  const [Content, setContent] = useState(() => null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function compileMdx() {
      try {
        const code = source?.trim()
          ? source
          : "# Novo arquivo\n\nComece a escrever seu conteúdo em **MDX**.";

        const result = await evaluate(code, {
          ...runtime,
          remarkPlugins: [remarkGfm],
        });

        if (!active) return;
        setError("");
        setContent(() => result.default);
      } catch (compileError) {
        if (!active) return;
        setContent(() => null);
        setError(String(compileError?.message || "Erro ao processar MDX."));
      }
    }

    compileMdx();

    return () => {
      active = false;
    };
  }, [source]);

  if (error) {
    return (
      <div className="p-3 text-sm border rounded-md border-red-200 bg-red-50 text-red-700">
        Erro no MDX: {error}
      </div>
    );
  }

  return (
    <article className="mdx-preview">
      {Content ? <Content /> : <p className="text-sm text-grayMd">Carregando preview...</p>}
    </article>
  );
}

MdxPreview.propTypes = {
  source: PropTypes.string,
};

MdxPreview.defaultProps = {
  source: "",
};
