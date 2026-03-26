import { NextResponse } from "next/server";
import { contributeInvestment } from "../../../../../lib/sqlite";
import { isAuthenticatedRequest } from "../../../../../lib/auth";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function POST(req, { params }) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;
    const data = contributeInvestment(getDeviceId(req), id, body?.coinsAmount);

    if (!data?.ok) {
      return NextResponse.json(
        {
          error:
            data?.reason === "INSUFFICIENT_COINS"
              ? "Moedas insuficientes."
              : "Investimento inválido.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Falha ao aportar." }, { status: 500 });
  }
}
