import "../index.css";
import "@mdxeditor/editor/style.css";
import ThemeSync from "../components/ThemeSync";

export const metadata = {
  title: "RPG da Vida",
  description: "App de organização pessoal em formato RPG",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
