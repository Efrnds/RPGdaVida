import { NextResponse } from "next/server";
import { deleteJournalEntry, updateJournalEntry } from "../../../../lib/sqlite";
import { isAuthenticatedRequest } from "../../../../lib/auth";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function PUT(req, { params }) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateJournalEntry(getDeviceId(req), id, body);

    if (!data) {
      return NextResponse.json(
        { error: "Entrada não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar entrada." },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const ok = deleteJournalEntry(getDeviceId(req), id);

    if (!ok) {
      return NextResponse.json(
        { error: "Entrada não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao remover entrada." },
      { status: 500 },
    );
  }
}
