import BrainDump from "../../../components/BrainDump";
import ModuleScreen from "../../../components/ModuleScreen";

export default function BrainDumpPage() {
  return (
    <ModuleScreen
      title="💡 Brain Dump"
      subtitle="Monte seu quadro de ideias"
      description="Transforme pensamentos soltos em tarefas claras e acionáveis."
      icon="🧠"
    >
      <div className="max-w-5xl p-3 mx-auto bg-white border rounded-md border-graySm">
        <BrainDump standalone />
      </div>
    </ModuleScreen>
  );
}
