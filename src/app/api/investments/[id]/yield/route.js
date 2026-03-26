import { NextResponse } from "next/server";
import { applyInvestmentYield } from "../../../../../lib/sqlite";
import { isAuthenticatedRequest } from "../../../../../lib/auth";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function POST(req, { params }) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const data = applyInvestmentYield(getDeviceId(req), id);

    if (!data?.ok) {
      return NextResponse.json({ error: "Investimento inválido." }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Falha ao aplicar rendimento." }, { status: 500 });
  }
}
