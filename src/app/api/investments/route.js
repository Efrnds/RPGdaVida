import { NextResponse } from "next/server";
import { createInvestment, listInvestments } from "../../../lib/sqlite";
import { isAuthenticatedRequest } from "../../../lib/auth";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function GET(req) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const data = listInvestments(getDeviceId(req));
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Falha ao listar investimentos." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const data = createInvestment(getDeviceId(req), body);
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Falha ao criar investimento." }, { status: 500 });
  }
}
