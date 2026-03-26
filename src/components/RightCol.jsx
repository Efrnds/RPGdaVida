import BrainDump from "./BrainDump.jsx";
import Activities from "./Activities.jsx";

export default function RightCol() {
  return (
    <section className="flex flex-col w-full gap-5 xl:w-[25%]">
      <div className="flex flex-col gap-4 p-4 bg-white border border-graySm rounded shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
        <BrainDump compact />
        <hr className="border-graySm/60 border-t-2 border-dashed" />
        <Activities compact />
      </div>
    </section>
  );
}
