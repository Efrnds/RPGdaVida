import { NextResponse } from "next/server";
import {
  createMarketItem,
  listMarketItems,
  redeemMarketItem,
} from "../../../lib/sqlite";
import { isAuthenticatedRequest } from "../../../lib/auth";

function getDeviceId(req) {
  return req.headers.get("x-device-id") || "anonymous-device";
}

export async function GET(req) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const deviceId = getDeviceId(req);
    const items = listMarketItems(deviceId);
    return NextResponse.json({ data: items });
  } catch {
    return NextResponse.json(
      { error: "Falha ao listar mercado." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const deviceId = getDeviceId(req);

    if (body?.action === "redeem") {
      const result = redeemMarketItem(deviceId, body.itemId);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.reason === "INSUFFICIENT_COINS" ? "Moedas insuficientes." : "Item inválido." },
          { status: 400 }
        );
      }

      return NextResponse.json({ data: result });
    }

    const item = createMarketItem(deviceId, body);
    return NextResponse.json({ data: item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Falha ao processar mercado." },
      { status: 500 }
    );
  }
}
