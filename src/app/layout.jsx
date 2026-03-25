import "../index.css";

export const metadata = {
  title: "RPG da Vida",
  description: "App de organização pessoal em formato RPG",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
