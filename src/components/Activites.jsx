import Title from "./Title";
export default function Activites() {
  return (
    <div>
      <Title title="🔄 Atividades" />
      {mapActivities.map((activity) => (
        <Activity />
      ))}
    </div>
  );
}
