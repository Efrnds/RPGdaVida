import { NextResponse } from "next/server";
import { getProfile, applyProfileProgress, createActivity } from "../../../../lib/sqlite";
import { processHealthMetrics } from "../../../../lib/gamification";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

/**
 * Converte qualquer entrada em um número válido, mesmo se for array ou string.
 */
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
    
    // Suporte a múltiplas chaves (Português/Inglês) para facilitar o Atalho
    const health = processHealthMetrics({
      steps: toNum(body.steps || body.passos),
      sleepHours: toNum(body.sleep || body.sono || body.sleepHours),
      heartRate: toNum(body.heart || body.batimentos || body.heartRate, "avg")
    });

    if (health.xp !== 0 || health.gold !== 0 || health.hp !== 0) {
      const updatedProfile = applyProfileProgress(deviceId, {
        xpDelta: health.xp,
        coinsDelta: health.gold,
        hpDelta: health.hp
      });

      createActivity(deviceId, {
        title: "Sincronização de Vida",
        status: health.hp < 0 ? "lost" : "won",
        description: health.description.join(" • "),
        values_text: `${health.xp >= 0 ? "+" : ""}${health.xp} XP • ${health.gold >= 0 ? "+" : ""}${health.gold} Moedas`
      });

      return NextResponse.json({
        message: "Evolução sincronizada!",
        rewards: health,
        profile: updatedProfile
      });
    }

    return NextResponse.json({ message: "Sem alterações relevantes no momento." });

  } catch (error) {
    console.error("Smart Sync Error:", error);
    return NextResponse.json({ error: "Erro na sincronização inteligente." }, { status: 500 });
  }
}
