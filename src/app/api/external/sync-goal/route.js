import { NextResponse } from "next/server";
import {
  ensureSeedData,
  updateGoal,
  completeGoal,
} from "../../../../lib/sqlite";

import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "rpg-da-vida.sqlite");
const db = new Database(dbPath);

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

    const { goal_name, value } = await req.json();

    if (!goal_name || value === undefined) {
      return NextResponse.json(
        {
          error:
            "É obrigatório enviar 'goal_name' (parte do nome da meta) e 'value' (valor atual) no JSON.",
        },
        { status: 400 },
      );
    }

    ensureSeedData(deviceId);

    // Suporte para o Atalho passando array de Amostras de Saúde em vez de soma única:
    let finalValue = 0;
    if (Array.isArray(value)) {
      finalValue = value.reduce((acc, curr) => {
        const val = typeof curr === "object" ? curr.value : curr;
        return acc + (Number(val) || 0);
      }, 0);
    } else {
      finalValue = Number(value) || 0;
    }

    if (finalValue <= 0) {
      return NextResponse.json(
        { error: "Nenhum valor válido recebido para atualizar a meta." },
        { status: 400 },
      );
    }

    // Buscar a meta em progresso no banco de dados que contém o keyword
    const goal = db
      .prepare(
        `
      SELECT * FROM goals 
      WHERE device_id = ? 
        AND status = 'in_progress' 
        AND title LIKE ? 
      ORDER BY created_at ASC LIMIT 1
    `,
      )
      .get(deviceId, `%${goal_name}%`);

    if (!goal) {
      return NextResponse.json(
        {
          message: `Nenhuma meta ativa (Em progresso) encontrada com o nome contendo "${goal_name}". Crie a meta no PWA primeiro!`,
        },
        { status: 404 },
      );
    }

    // Se a meta foi encontrada, vamos atualizar o progresso dela!
    if (finalValue >= goal.target_value) {
      // Bateu a meta! Finaliza e entrega XP/Gold
      const result = completeGoal(deviceId, goal.id);
      return NextResponse.json({
        message: `Sua meta externa "${goal.title}" foi concluída e as recompensas foram liberadas com sucesso!`,
        goal: result.goal,
        profile: result.profile,
      });
    } else {
      // Apenas atualiza o progresso no banco sem completar
      const updated = updateGoal(deviceId, goal.id, {
        current_value: finalValue,
      });
      return NextResponse.json({
        message: `Progresso da meta "${goal.title}" atualizado para ${finalValue}/${goal.target_value}. Falta pouco!`,
        goal: updated,
      });
    }
  } catch (error) {
    console.error("External Sync Goal Error:", error);
    return NextResponse.json(
      { error: "Falha interna ao tentar sincronizar o progresso da meta." },
      { status: 500 },
    );
  }
}
