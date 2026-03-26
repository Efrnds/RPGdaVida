import MobileRpgNav from "../../components/MobileRpgNav";
import MobileRpgHeader from "../../components/MobileRpgHeader";

export default function HomeLayout({ children }) {
  return (
    <div className="home-shell relative min-h-screen">
      <MobileRpgHeader />
      {children}
      <MobileRpgNav />
    </div>
  );
}
