/**
 * Motor de Gamificação do RPG da Vida
 * Focado em progresso de metas existentes.
 */

/**
 * Mapeia métricas de saúde para categorias de metas.
 */
export function mapHealthToGoalProgress({ steps = 0, sleepHours = 0, heartRate = 0 }) {
  const progressUpdates = [];

  // Passos -> Geralmente categoria 'saúde' ou 'fitness'
  if (steps > 0) {
    progressUpdates.push({
      category: 'saude',
      type: 'steps',
      value: steps,
      description: `${steps} passos`
    });
  }

  // Sono -> Categoria 'saúde' ou 'bem-estar'
  if (sleepHours > 0) {
    progressUpdates.push({
      category: 'saude',
      type: 'sleep',
      value: sleepHours,
      description: `${sleepHours}h de sono`
    });
  }

  // Batimentos (Treino) -> Categoria 'saúde'
  if (heartRate > 120) {
    progressUpdates.push({
      category: 'saude',
      type: 'workout',
      value: 1, // Conta como 1 treino concluído se o batimento subiu
      description: "Treino detectado (Batimento alto)"
    });
  }

  return progressUpdates;
}
