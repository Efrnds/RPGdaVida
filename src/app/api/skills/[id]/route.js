import { NextResponse } from "next/server";
import { deleteSkill, updateSkill } from "../../../../lib/sqlite";
import { isAuthenticatedRequest } from "../../../../lib/auth";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function PUT(req, { params }) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const deviceId = getDeviceId(req);
    const { id } = await params;
    const body = await req.json();
    const skill = updateSkill(deviceId, id, body);

    if (!skill) {
      return NextResponse.json({ error: "Skill não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ data: skill });
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar skill." },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const deviceId = getDeviceId(req);
    const { id } = await params;
    const ok = deleteSkill(deviceId, id);

    if (!ok) {
      return NextResponse.json({ error: "Skill não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao remover skill." },
      { status: 500 }
    );
  }
}
