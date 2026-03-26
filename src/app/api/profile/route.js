import { NextResponse } from "next/server";
import { getProfile, upsertProfile } from "../../../lib/sqlite";
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
    const profile = getProfile(deviceId);

    return NextResponse.json({ data: profile });
  } catch {
    return NextResponse.json(
      { error: "Falha ao carregar perfil." },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const deviceId = getDeviceId(req);
    const body = await req.json();
    const profile = upsertProfile(deviceId, body);

    return NextResponse.json({ data: profile });
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar perfil." },
      { status: 500 },
    );
  }
}
