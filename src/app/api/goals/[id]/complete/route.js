import { NextResponse } from "next/server";
import { completeGoal } from "../../../../../lib/sqlite";
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
    const data = completeGoal(getDeviceId(req), id);

    if (!data) {
      return NextResponse.json(
        { error: "Meta não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Falha ao concluir meta." },
      { status: 500 },
    );
  }
}
