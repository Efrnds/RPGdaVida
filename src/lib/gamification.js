/**
 * Motor de Gamificação do RPG da Vida
 * Versão Robusta: Focada apenas em XP, Vida (HP) e Moedas.
 */

export const DIFFICULTY_LEVELS = {
  1: { xp: 10, gold: 5 },
  2: { xp: 25, gold: 12 },
  3: { xp: 60, gold: 30 },
  4: { xp: 150, gold: 70 },
  5: { xp: 400, gold: 200 },
};

export function processHealthMetrics({ steps = 0, sleepHours = 0, heartRate = 0 }) {
  const rewards = {
    xp: 0,
    gold: 0,
    hp: 0,
    description: []
  };

  // Passos: Cada 1000 passos = 2 Moedas e 3 XP
  if (steps > 0) {
    const sets = Math.floor(steps / 1000);
    if (sets > 0) {
      rewards.gold += sets * 2;
      rewards.xp += sets * 3;
      rewards.description.push(`${steps} passos`);
    }
  }

  // Sono: Recupera HP e um pouco de XP
  if (sleepHours >= 7) {
    rewards.hp += 20;
    rewards.xp += 10;
    rewards.description.push("Sono revigorante");
  } else if (sleepHours > 0 && sleepHours < 5) {
    rewards.hp -= 10;
    rewards.description.push("Sono insuficiente");
  }

  // Batimentos: Intensidade alta dá XP geral
  if (heartRate > 120) {
    rewards.xp += 15;
    rewards.description.push("Atividade intensa");
  }

  return rewards;
}
