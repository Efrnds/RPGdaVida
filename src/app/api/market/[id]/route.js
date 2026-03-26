import { NextResponse } from "next/server";
import { deleteMarketItem, updateMarketItem } from "../../../../lib/sqlite";
import { isAuthenticatedRequest } from "../../../../lib/auth";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function PUT(req, { params }) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const deviceId = getDeviceId(req);
    const { id } = await params;

    const item = updateMarketItem(deviceId, id, body);
    if (!item) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar item." },
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
    const ok = deleteMarketItem(deviceId, id);

    if (!ok) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao remover item." },
      { status: 500 }
    );
  }
}
