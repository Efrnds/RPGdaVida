import BrainDump from "./BrainDump.jsx";
import Activities from "./Activities.jsx";

export default function RightCol() {
  return (
    <section className="flex flex-col w-1/4 gap-8">
      <BrainDump />
      <hr />
      <Activities />
    </section>
  );
}
