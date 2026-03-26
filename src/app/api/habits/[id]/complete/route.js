import { NextResponse } from "next/server";
import { completeHabit } from "../../../../../lib/sqlite";
import { isAuthenticatedRequest } from "../../../../../lib/auth";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function POST(req, { params }) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const deviceId = getDeviceId(req);
    const { id } = await params;
    const result = completeHabit(deviceId, id);

    if (!result) {
      return NextResponse.json({ error: "Hábito não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "Falha ao registrar hábito." },
      { status: 500 }
    );
  }
}
