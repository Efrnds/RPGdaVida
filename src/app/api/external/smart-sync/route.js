import { NextResponse } from "next/server";
import { 
  getProfile, 
  listGoals, 
  updateGoal, 
  completeGoal, 
  createActivity 
} from "../../../../lib/sqlite";
import { mapHealthToGoalProgress } from "../../../../lib/gamification";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

function toNum(val, mode = "sum") {
  if (val === undefined || val === null) return 0;
  if (Array.isArray(val)) {
    const numbers = val.map(v => (typeof v === "object" ? v.value : v)).map(Number).filter(n => !isNaN(n));
    if (numbers.length === 0) return 0;
    if (mode === "avg") return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return numbers.reduce((a, b) => a + b, 0);
  }
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

export async function POST(req) {
  try {
    const deviceId = getDeviceId(req);
    if (deviceId === "anonymous-device") {
      return NextResponse.json({ error: "x-device-id ausente." }, { status: 401 });
    }

    const body = await req.json();
    const goals = listGoals(deviceId);
    
    // 1. Mapear o que chegou do smartwatch para o progresso de metas
    const updates = mapHealthToGoalProgress({
      steps: toNum(body.steps || body.passos),
      sleepHours: toNum(body.sleep || body.sono || body.sleepHours),
      heartRate: toNum(body.heart || body.batimentos || body.heartRate, "avg")
    });

    if (updates.length === 0) {
      return NextResponse.json({ message: "Nenhum dado relevante recebido." });
    }

    let progressMade = false;
    const completedGoals = [];

    // 2. Tentar aplicar o progresso em metas existentes
    for (const update of updates) {
      // Procura uma meta ativa da mesma categoria (ex: 'saude') que não esteja concluída
      const targetGoal = goals.find(g => 
        g.category.toLowerCase() === update.category.toLowerCase() && 
        g.status !== 'done'
      );

      if (targetGoal) {
        // Se a meta for de passos, atualizamos o valor incrementalmente
        // Se for de sono, podemos atualizar também
        let newValue = targetGoal.current_value + (update.type === 'workout' ? 1 : update.value);
        
        // Garante que não ultrapasse o alvo
        newValue = Math.min(newValue, targetGoal.target_value);

        updateGoal(deviceId, targetGoal.id, {
          ...targetGoal,
          current_value: newValue
        });

        progressMade = true;

        // 3. Se atingiu o alvo, completa a meta e gera a recompensa
        if (newValue >= targetGoal.target_value) {
          const result = completeGoal(deviceId, targetGoal.id);
          completedGoals.push(result.goal.title);
        }
      }
    }

    if (progressMade) {
      let logMsg = "Progresso em metas sincronizado!";
      if (completedGoals.length > 0) {
        logMsg = `Metas concluídas: ${completedGoals.join(", ")}! Recompensas aplicadas.`;
      }

      createActivity(deviceId, {
        title: "Sincronização de Metas",
        status: "won",
        description: `Dados do Smartwatch integrados às suas metas de vida.`,
        values_text: completedGoals.length > 0 ? "RECOMPENSA LIBERADA!" : "Progresso salvo"
      });

      return NextResponse.json({
        message: logMsg,
        profile: getProfile(deviceId)
      });
    }

    return NextResponse.json({ message: "Nenhuma meta ativa para essa atividade." });

  } catch (error) {
    console.error("Smart Sync Error:", error);
    return NextResponse.json({ error: "Erro na sincronização de metas." }, { status: 500 });
  }
}
