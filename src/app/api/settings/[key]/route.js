import { NextResponse } from "next/server";
import { getSetting, setSetting } from "../../../../lib/sqlite";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function GET(req, { params }) {
  try {
    const deviceId = getDeviceId(req);
    const { key } = await params;
    const value = getSetting(deviceId, key);

    return NextResponse.json({ value });
  } catch {
    return NextResponse.json(
      { error: "Falha ao ler configuração." },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const deviceId = getDeviceId(req);
    const { key } = await params;
    const body = await req.json();

    setSetting(deviceId, key, body?.value ?? null);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao salvar configuração." },
      { status: 500 }
    );
  }
}
