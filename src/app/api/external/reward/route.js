import { NextResponse } from "next/server";
import {
  ensureSeedData,
  getProfile,
  applyProfileProgress,
  createActivity,
} from "../../../../lib/sqlite";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

// Dependência de acesso banco diretão para verificação de "já rodou hoje":
import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "rpg-da-vida.sqlite");
const db = new Database(dbPath);

export async function POST(req) {
  try {
    const deviceId = getDeviceId(req);

    if (deviceId === "anonymous-device") {
      return NextResponse.json(
        { error: "Chave do RPG (x-device-id) ausente." },
        { status: 401 },
      );
    }

    const { title, description, xp, gold } = await req.json();

    if (!title || !xp || !gold) {
      return NextResponse.json(
        { error: "Você precisa enviar 'title', 'xp' e 'gold' no JSON." },
        { status: 400 },
      );
    }

    ensureSeedData(deviceId);

    // Proteção contra rodar o atalho 2x no mesmo dia e ganhar XP duplo:
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayStartMs = dayStart.getTime();

    const activityTitle = `Recompensa Automática: ${title}`;

    const alreadySynced = db
      .prepare(
        `
      SELECT * FROM activities 
      WHERE device_id = ? AND title = ? AND created_at >= ? LIMIT 1
    `,
      )
      .get(deviceId, activityTitle, dayStartMs);

    if (alreadySynced) {
      return NextResponse.json(
        { message: "Você já resgatou essa recompensa hoje do seu iPhone!" },
        { status: 200 },
      );
    }

    const xpReward = Number(xp) || 0;
    const goldReward = Number(gold) || 0;

    const profile = applyProfileProgress(deviceId, {
      coinsDelta: goldReward,
      xpDelta: xpReward,
    });

    createActivity(deviceId, {
      title: activityTitle,
      status: "won",
      description:
        description ||
        "Recompensa gerada por uma Automação Externa do seu celular.",
      values_text: `+${goldReward} moedas • +${xpReward} XP`,
    });

    return NextResponse.json({
      message: "Recompensa mágica resgatada com sucesso!",
      recompensas: `+${goldReward} moedas, +${xpReward} XP`,
      profile,
    });
  } catch (error) {
    console.error("External Reward Sync Error:", error);
    return NextResponse.json(
      { error: "Falha interna ao processar a recompensa dinâmica." },
      { status: 500 },
    );
  }
}
