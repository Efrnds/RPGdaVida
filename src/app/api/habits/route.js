import { NextResponse } from "next/server";
import { createHabit, listHabits } from "../../../lib/sqlite";
import { isAuthenticatedRequest } from "../../../lib/auth";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function GET(req) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const deviceId = getDeviceId(req);
    const type = req.nextUrl.searchParams.get("type");
    const habits = listHabits(deviceId, type);
    return NextResponse.json({ data: habits });
  } catch {
    return NextResponse.json(
      { error: "Falha ao listar hábitos." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const deviceId = getDeviceId(req);
    const body = await req.json();
    const habit = createHabit(deviceId, body);
    return NextResponse.json({ data: habit }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar hábito." },
      { status: 500 }
    );
  }
}
