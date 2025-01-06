import Title from "./Title";
import Activity from "./Activity";
export default function Activities() {
  const mapActivities = [
    {
      title: "@22 de Agosto, 2024 8:51 PM",
      status: "lost",
      description:
        "Você foi derrotado na luta contra o monstro da gastrite e perdeu 10HP! - Não tomou o remédio para gastrite",
      values: "-10 HP!",
    },
    {
      status: "limit",
      description:
        "Parabéns, você não utilizou o limite especial na última semana! Sem penalidade de Limite Especial pra você!",
    },
    {
      title: "@18 de Agosto, 2024 7:36 AM",
      status: "won",
      description: "Você ganhou 5 EXP! - Fez academia.",
      values: "+5 EXP!",
    },
    {
      title: "Atividade 4",
      status: "won",
      description: "Você ganhou 10 exp e e 10 moedas na tarefa de exemplo 1!",
      values: "+10 EXP e +10 Moedas!",
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <Title title="🔄 Atividades" />
      <div className="flex flex-col gap-2">
        {mapActivities.map((activity) => (
          <Activity
            key={activity.title}
            title={activity.title}
            lostOrWon={activity.status}
            desc={activity.description}
            values={activity.values}
          />
        ))}
      </div>
    </div>
  );
}
