import { NextResponse } from "next/server";
import { createActivity, listActivities } from "../../../lib/sqlite";
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
    const activities = listActivities(deviceId);

    return NextResponse.json({ data: activities });
  } catch {
    return NextResponse.json(
      { error: "Falha ao listar atividades." },
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
    const activity = createActivity(deviceId, body);

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar atividade." },
      { status: 500 }
    );
  }
}
