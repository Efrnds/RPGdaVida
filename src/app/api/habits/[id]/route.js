import { NextResponse } from "next/server";
import { deleteHabit, updateHabit } from "../../../../lib/sqlite";
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

    const habit = updateHabit(deviceId, id, body);
    if (!habit) {
      return NextResponse.json({ error: "Hábito não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: habit });
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar hábito." },
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
    const ok = deleteHabit(deviceId, id);

    if (!ok) {
      return NextResponse.json({ error: "Hábito não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao remover hábito." },
      { status: 500 }
    );
  }
}
