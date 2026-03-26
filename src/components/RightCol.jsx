import BrainDump from "./BrainDump.jsx";
import Activities from "./Activities.jsx";

export default function RightCol() {
  return (
    <section className="flex flex-col w-full gap-3 xl:w-[25%]">
      <BrainDump compact />
      <hr className="border-graySm" />
      <Activities compact />
    </section>
  );
}
