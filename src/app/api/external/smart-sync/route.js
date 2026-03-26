import { NextResponse } from "next/server";
import {
  ensureSeedData,
  applyProfileProgress,
  createActivity,
} from "../../../../lib/sqlite";
import {
  processHealthMetrics,
  processWaterIntake,
} from "../../../../lib/gamification";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (Array.isArray(value)) {
    return value.reduce((acc, item) => acc + toNumber(item), 0);
  }

  if (value && typeof value === "object") {
    if ("value" in value) return toNumber(value.value);
    if ("amount" in value) return toNumber(value.amount);
  }

  return 0;
}

function normalizeSleepHours(rawSleep) {
  const sleep = toNumber(rawSleep);
  if (sleep <= 0) return 0;

  // Atalhos pode enviar horas, minutos ou segundos dependendo da ação/configuração.
  if (sleep > 24 * 60) return sleep / 3600; // segundos -> horas
  if (sleep > 24) return sleep / 60; // minutos -> horas
  return sleep; // já em horas
}

async function parseBody(req) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await req.json();
  }

  const rawText = await req.text();
  if (!rawText?.trim()) return {};

  try {
    return JSON.parse(rawText);
  } catch {
    // fallback para payloads simples: "steps=123&sleep=7"
    const params = new URLSearchParams(rawText);
    return {
      steps: params.get("steps"),
      sleep: params.get("sleep"),
      heart: params.get("heart"),
      ml: params.get("ml") || params.get("water"),
    };
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/external/smart-sync" });
}

export async function POST(req) {
  try {
    const deviceId = getDeviceId(req);
    if (deviceId === "anonymous-device") {
      return NextResponse.json(
        { error: "x-device-id ausente." },
        { status: 401 },
      );
    }

    const body = await parseBody(req);
    ensureSeedData(deviceId);

    const steps = toNumber(body.steps);
    const sleepHours = normalizeSleepHours(body.sleep);
    const heartRate = toNumber(body.heart);
    const waterMl = toNumber(body.ml || body.water);

    if (steps <= 0 && sleepHours <= 0 && heartRate <= 0 && waterMl <= 0) {
      return NextResponse.json(
        {
          error:
            "Payload inválido. Envie ao menos um destes campos com valor numérico: steps, sleep, heart, ml/water.",
        },
        { status: 400 },
      );
    }

    let finalRewards = { xp: 0, gold: 0, hp: 0 };
    const logDetails = [];

    // 1. Processar Saúde (Passos, Sono, Batimentos)
    const health = processHealthMetrics({
      steps,
      sleepHours,
      heartRate,
    });

    if (health.xp !== 0 || health.gold !== 0 || health.hp !== 0) {
      finalRewards.xp += health.xp;
      finalRewards.gold += health.gold;
      finalRewards.hp += health.hp;
      logDetails.push(...health.description);
    }

    // 2. Processar Água (ml)
    if (waterMl > 0) {
      const water = processWaterIntake(waterMl);
      if (water) {
        finalRewards.xp += water.xp;
        finalRewards.gold += water.gold;
        logDetails.push(water.description);
      }
    }

    // 3. Aplicar progresso se houver algo a ganhar/perder
    if (
      finalRewards.xp !== 0 ||
      finalRewards.gold !== 0 ||
      finalRewards.hp !== 0
    ) {
      const updatedProfile = applyProfileProgress(deviceId, {
        xpDelta: finalRewards.xp,
        coinsDelta: finalRewards.gold,
        hpDelta: finalRewards.hp,
      });

      createActivity(deviceId, {
        title: "Sincronização de Vida",
        status: finalRewards.hp < 0 ? "lost" : "won",
        description: logDetails.join(" • "),
        values_text: `${finalRewards.xp >= 0 ? "+" : ""}${finalRewards.xp} XP • ${finalRewards.gold >= 0 ? "+" : ""}${finalRewards.gold} Moedas`,
      });

      return NextResponse.json({
        message: "Evolução sincronizada!",
        rewards: finalRewards,
        profile: updatedProfile,
      });
    }

    return NextResponse.json({ message: "Sem alterações relevantes." });
  } catch (error) {
    console.error("Smart Sync Error:", error);
    return NextResponse.json(
      {
        error:
          "Erro na sincronização inteligente. Verifique se o Atalho está enviando JSON com fields numéricos.",
      },
      { status: 500 },
    );
  }
}
