import { NextResponse } from "next/server";
import { createSkill, listSkills } from "../../../lib/sqlite";
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
    const skills = listSkills(deviceId);

    return NextResponse.json({ data: skills });
  } catch {
    return NextResponse.json(
      { error: "Falha ao listar skills." },
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
    const skill = createSkill(deviceId, body);

    return NextResponse.json({ data: skill }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar skill." },
      { status: 500 }
    );
  }
}
