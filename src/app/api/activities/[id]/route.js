import { NextResponse } from "next/server";
import { deleteActivity, updateActivity } from "../../../../lib/sqlite";
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
    const activity = updateActivity(deviceId, id, body);

    if (!activity) {
      return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ data: activity });
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar atividade." },
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
    const ok = deleteActivity(deviceId, id);

    if (!ok) {
      return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao remover atividade." },
      { status: 500 }
    );
  }
}
