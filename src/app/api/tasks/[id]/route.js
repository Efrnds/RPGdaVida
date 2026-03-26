import { NextResponse } from "next/server";
import { deleteTask, updateTask } from "../../../../lib/sqlite";
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
    const task = updateTask(deviceId, id, body);

    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ data: task });
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar tarefa." },
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
    const ok = deleteTask(deviceId, id);

    if (!ok) {
      return NextResponse.json({ error: "Tarefa não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao remover tarefa." },
      { status: 500 }
    );
  }
}
