/**
 * Motor de Gamificação do RPG da Vida
 * Focado apenas em XP, Vida (HP), Moedas e XP de Skill.
 */

export const DIFFICULTY_LEVELS = {
  1: { xp: 10, gold: 5, label: "Trivial" },
  2: { xp: 25, gold: 12, label: "Fácil" },
  3: { xp: 60, gold: 30, label: "Médio" },
  4: { xp: 150, gold: 70, label: "Difícil" },
  5: { xp: 400, gold: 200, label: "Lendário" },
};

/**
 * Processa métricas de saúde e converte em recompensas básicas.
 */
export function processHealthMetrics({ steps = 0, sleepHours = 0, heartRate = 0 }) {
  const rewards = {
    xp: 0,
    gold: 0,
    hp: 0,
    description: []
  };

  // Passos: Cada 1000 passos = 2 Moedas e 3 XP
  if (steps > 0) {
    rewards.gold += Math.floor(steps / 1000) * 2;
    rewards.xp += Math.floor(steps / 1000) * 3;
    rewards.description.push(`${steps} passos`);
  }

  // Sono: Sono bom recupera vida
  if (sleepHours >= 7) {
    rewards.hp += 20;
    rewards.xp += 10;
    rewards.description.push("Sono revigorante");
  } else if (sleepHours > 0 && sleepHours < 5) {
    rewards.hp -= 10;
    rewards.description.push("Sono insuficiente (Penalidade)");
  }

  // Batimentos Instantâneos: Se estiver alto (treino), dá XP
  if (heartRate > 120) {
    rewards.xp += 15;
    rewards.description.push("Intensidade alta detectada");
  }

  return rewards;
}

/**
 * Processa consumo de água por volume (ml)
 */
export function processWaterIntake(volumeMl) {
  const volume = Number(volumeMl) || 0;
  if (volume <= 0) return null;

  return {
    xp: Math.floor(volume / 50), // 50ml = 1 XP
    gold: Math.floor(volume / 250) * 2, // 250ml = 2 Moedas
    description: `Bebeu ${volume}ml de água`
  };
}
