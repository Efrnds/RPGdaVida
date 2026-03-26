import { NextResponse } from "next/server";
import { getMetrics } from "../../../lib/sqlite";
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
    const days = Number(req.nextUrl.searchParams.get("days") || "30");
    const data = getMetrics(deviceId, days);

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Falha ao carregar métricas." },
      { status: 500 }
    );
  }
}
