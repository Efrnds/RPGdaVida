import { NextResponse } from "next/server";
import { addSkillXp } from "../../../../../lib/sqlite";
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
    const body = await req.json().catch(() => ({}));
    const data = addSkillXp(getDeviceId(req), id, body?.xpAmount ?? 1);

    if (!data) {
      return NextResponse.json(
        { error: "Skill não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Falha ao aplicar XP na skill." },
      { status: 500 },
    );
  }
}
