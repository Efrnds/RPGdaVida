import Activities from "../../../components/Activities";
import ModuleScreen from "../../../components/ModuleScreen";

export default function AtividadesPage() {
  return (
    <ModuleScreen
      title="🔄 Atividades"
      subtitle="Registre suas missões"
      description="Organize tudo que você fez e acompanhe seu progresso diário."
      icon="📜"
    >
      <div className="max-w-5xl p-3 mx-auto bg-white border rounded-md border-graySm">
        <Activities standalone />
      </div>
    </ModuleScreen>
  );
}
