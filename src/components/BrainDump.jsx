import Task from "./Task.jsx";

export default function BrainDump() {
  const tasks = [
    {
      title: "Comprar comida do cachorro",
      level: "Level 1",
      status: "CONCLUÍDO",
    },
    { title: "Responder os emails", level: "Level 2", status: "A FAZER" },
    {
      today: <p className="font-bold text-grayMd">🕛 Hoje 8AM</p>,
      title: "Reunião com os clientes",
      level: "Level 3",
      status: "A FAZER",
    },
  ];
  return (
    <div>
      <div className="flex border-b border-b-graySm">
        <h2 className="-mb-px border-b-2 w-fit h-fit border-b-black">
          💡 Brain Dump
        </h2>
      </div>
      <div className="flex flex-col gap-2 py-2">
        {tasks.map((task) => (
          <Task
            key={task.title}
            title={task.title}
            level={task.level}
            status={task.status}
            today={task.today}
          />
        ))}
      </div>
      <div className="text-sm font-bold text-graySm">
        Nova Tarefa +
      </div>
    </div>
  );
}
