import { NextResponse } from "next/server";
import { createJournalEntry, listJournalEntries } from "../../../lib/sqlite";
import { isAuthenticatedRequest } from "../../../lib/auth";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function GET(req) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const data = listJournalEntries(getDeviceId(req));
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Falha ao listar diário." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const data = createJournalEntry(getDeviceId(req), body);
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Falha ao criar entrada." }, { status: 500 });
  }
}
