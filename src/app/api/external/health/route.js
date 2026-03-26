import { NextResponse } from "next/server";
import { syncAppleHealthSteps } from "../../../../lib/sqlite";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function POST(req) {
  try {
    const deviceId = getDeviceId(req);

    if (deviceId === "anonymous-device") {
      return NextResponse.json(
        { error: "Chave do RPG (x-device-id) ausente." },
        { status: 401 },
      );
    }

    const body = await req.json();

    // Support both raw numbers, stringified numbers, or arrays from Apple Shortcuts
    let passos = 0;

    if (Array.isArray(body.passos)) {
      // If the Shortcut accidentally sends the raw Health Samples array, sum their values
      passos = body.passos.reduce((acc, curr) => {
        const val = typeof curr === "object" ? curr.value : curr;
        return acc + (Number(val) || 0);
      }, 0);
    } else if (body.passos) {
      passos = Number(body.passos) || 0;
    }

    if (passos <= 0) {
      return NextResponse.json(
        {
          error:
            "Nenhum dado válido de passos encontrado. Verifique seu Atalho!",
        },
        { status: 400 },
      );
    }

    const result = syncAppleHealthSteps(deviceId, passos);

    if (!result.ok) {
      if (result.reason === "ALREADY_SYNCED_TODAY") {
        return NextResponse.json(
          { message: "Já sincronizado hoje. Tente novamente amanhã!" },
          { status: 200 }, // Não é erro, só não recompensa duplo
        );
      }
      if (result.reason === "NOT_ENOUGH_STEPS") {
        return NextResponse.json(
          { message: "Passos insuficientes para recompensas do RPG." },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { error: "Não foi possível sincronizar no momento." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Saúde sincronizada com sucesso!",
      recompensas: `+${result.goldReward} moedas, +${result.xpReward} XP`,
      profile: result.profile,
    });
  } catch (error) {
    console.error("Health Sync Error:", error);
    return NextResponse.json(
      { error: "Falha interna ao processar Sincronização." },
      { status: 500 },
    );
  }
}
