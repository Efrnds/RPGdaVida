import { NextResponse } from "next/server";
import { createTask, listTasks } from "../../../lib/sqlite";
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
    const tasks = listTasks(deviceId);

    return NextResponse.json({ data: tasks });
  } catch {
    return NextResponse.json(
      { error: "Falha ao listar tarefas." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const deviceId = getDeviceId(req);
    const body = await req.json();
    const task = createTask(deviceId, body);

    return NextResponse.json({ data: task }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar tarefa." },
      { status: 500 }
    );
  }
}
