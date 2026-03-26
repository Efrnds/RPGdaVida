import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "rpg-da-vida.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    device_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (device_id, key)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    device_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    level INTEGER NOT NULL,
    coins INTEGER NOT NULL,
    hp_total INTEGER NOT NULL,
    hp_current INTEGER NOT NULL,
    main_objective TEXT,
    secondary_objective TEXT,
    strengths TEXT,
    weaknesses TEXT,
    goals_completion INTEGER NOT NULL,
    xp_current INTEGER NOT NULL,
    xp_target INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    title TEXT NOT NULL,
    current_xp INTEGER NOT NULL,
    target_xp INTEGER NOT NULL,
    level INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    title TEXT NOT NULL,
    level INTEGER NOT NULL,
    status TEXT NOT NULL,
    due_label TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    title TEXT,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    values_text TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    frequency TEXT NOT NULL,
    reward_coins INTEGER NOT NULL,
    damage_hp INTEGER NOT NULL,
    active INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS habit_completions (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    habit_id TEXT NOT NULL,
    completed_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS market_items (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    title TEXT NOT NULL,
    cost_coins INTEGER NOT NULL,
    description TEXT,
    active INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS market_redemptions (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    cost_coins INTEGER NOT NULL,
    redeemed_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    current_value INTEGER NOT NULL,
    reward_coins INTEGER NOT NULL,
    reward_xp INTEGER NOT NULL,
    due_date TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    completed_at INTEGER
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS para_items (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    title TEXT NOT NULL,
    bucket TEXT NOT NULL,
    status TEXT NOT NULL,
    next_action TEXT,
    notes TEXT,
    due_date TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT,
    tags TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS investments (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    title TEXT NOT NULL,
    invested_coins INTEGER NOT NULL,
    current_value INTEGER NOT NULL,
    monthly_yield_percent REAL NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

function createId() {
  return crypto.randomUUID();
}

function now() {
  return Date.now();
}

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function ensureSeedData(deviceId) {
  const hasProfile = db
    .prepare("SELECT 1 FROM profile WHERE device_id = ?")
    .get(deviceId);

  // Se o perfil já existe, o usuário já inicializou os dados uma vez.
  // Não recriar dados padrão para respeitar exclusões manuais (ex.: skills apagadas).
  if (hasProfile) {
    return;
  }

  upsertProfile(deviceId, {
    username: "John Doe",
    level: 1,
    coins: 120,
    hp_total: 1000,
    hp_current: 800,
    main_objective: "Viajar pelo mundo",
    secondary_objective: "Ter estabilidade financeira",
    strengths: "Autodidata",
    weaknesses: "Procrastinador",
    goals_completion: 40,
    xp_current: 1000,
    xp_target: 2000,
  });

  const hasSkills = db
    .prepare("SELECT 1 FROM skills WHERE device_id = ? LIMIT 1")
    .get(deviceId);

  if (!hasSkills) {
    const insert = db.prepare(`
      INSERT INTO skills (id, device_id, title, current_xp, target_xp, level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdAt = now();
    const defaults = [
      ["💡 Criatividade", 1000, 2000, 2],
      ["💻 Programação", 500, 2000, 1],
      ["🍎 Saúde", 1500, 2000, 3],
      ["📖 Aprendizado", 2000, 2000, 4],
    ];

    for (const [title, currentXp, targetXp, level] of defaults) {
      insert.run(
        createId(),
        deviceId,
        title,
        currentXp,
        targetXp,
        level,
        createdAt,
        createdAt,
      );
    }
  }

  const hasTasks = db
    .prepare("SELECT 1 FROM tasks WHERE device_id = ? LIMIT 1")
    .get(deviceId);

  if (!hasTasks) {
    const insert = db.prepare(`
      INSERT INTO tasks (id, device_id, title, level, status, due_label, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdAt = now();
    const defaults = [
      ["Comprar comida do cachorro", 1, "CONCLUÍDO", null],
      ["Responder os emails", 2, "A FAZER", null],
      ["Reunião com os clientes", 3, "A FAZER", "🕛 Hoje 8AM"],
    ];

    for (const [title, level, status, dueLabel] of defaults) {
      insert.run(
        createId(),
        deviceId,
        title,
        level,
        status,
        dueLabel,
        createdAt,
        createdAt,
      );
    }
  }

  const hasActivities = db
    .prepare("SELECT 1 FROM activities WHERE device_id = ? LIMIT 1")
    .get(deviceId);

  if (!hasActivities) {
    const insert = db.prepare(`
      INSERT INTO activities (id, device_id, title, status, description, values_text, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdAt = now();
    const defaults = [
      [
        "@22 de Agosto, 2024 8:51 PM",
        "lost",
        "Você foi derrotado na luta contra o monstro da gastrite e perdeu 10HP! - Não tomou o remédio para gastrite",
        "-10 HP!",
      ],
      [
        null,
        "limit",
        "Parabéns, você não utilizou o limite especial na última semana! Sem penalidade de Limite Especial pra você!",
        null,
      ],
      [
        "@18 de Agosto, 2024 7:36 AM",
        "won",
        "Você ganhou 5 EXP! - Fez academia.",
        "+5 EXP!",
      ],
    ];

    for (const [title, status, description, valuesText] of defaults) {
      insert.run(
        createId(),
        deviceId,
        title,
        status,
        description,
        valuesText,
        createdAt,
        createdAt,
      );
    }
  }

  const hasHabits = db
    .prepare("SELECT 1 FROM habits WHERE device_id = ? LIMIT 1")
    .get(deviceId);

  if (!hasHabits) {
    const insert = db.prepare(`
      INSERT INTO habits (
        id, device_id, title, type, frequency, reward_coins, damage_hp, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdAt = now();
    const defaults = [
      ["Beber 2L de água", "good", "daily", 5, 0, 1],
      ["Ler por 20 minutos", "good", "daily", 3, 0, 1],
      ["Dormir depois das 2h", "bad", "daily", 0, 8, 1],
      ["Comer ultraprocessado", "bad", "weekly", 0, 15, 1],
    ];

    for (const [
      title,
      type,
      frequency,
      rewardCoins,
      damageHp,
      active,
    ] of defaults) {
      insert.run(
        createId(),
        deviceId,
        title,
        type,
        frequency,
        rewardCoins,
        damageHp,
        active,
        createdAt,
        createdAt,
      );
    }
  }

  const hasMarketItems = db
    .prepare("SELECT 1 FROM market_items WHERE device_id = ? LIMIT 1")
    .get(deviceId);

  if (!hasMarketItems) {
    const insert = db.prepare(`
      INSERT INTO market_items (
        id, device_id, title, cost_coins, description, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdAt = now();
    const defaults = [
      ["Pizza no sábado", 80, "Recompensa de lazer", 1],
      ["Filme no cinema", 120, "Momento de descanso", 1],
      ["Comprar um livro", 150, "Investir em aprendizado", 1],
    ];

    for (const [title, costCoins, description, active] of defaults) {
      insert.run(
        createId(),
        deviceId,
        title,
        costCoins,
        description,
        active,
        createdAt,
        createdAt,
      );
    }
  }

  const hasGoals = db
    .prepare("SELECT 1 FROM goals WHERE device_id = ? LIMIT 1")
    .get(deviceId);

  if (!hasGoals) {
    const insert = db.prepare(`
      INSERT INTO goals (
        id, device_id, title, category, status, target_value, current_value,
        reward_coins, reward_xp, due_date, created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdAt = now();
    const defaults = [
      ["Fechar 20 treinos no mês", "saude", "in_progress", 20, 8, 50, 40, null],
      [
        "Ler 3 livros no trimestre",
        "aprendizado",
        "in_progress",
        3,
        1,
        70,
        60,
        null,
      ],
      [
        "Juntar 1000 moedas",
        "financas",
        "in_progress",
        1000,
        120,
        120,
        80,
        null,
      ],
    ];

    for (const [
      title,
      category,
      status,
      targetValue,
      currentValue,
      rewardCoins,
      rewardXp,
      dueDate,
    ] of defaults) {
      insert.run(
        createId(),
        deviceId,
        title,
        category,
        status,
        targetValue,
        currentValue,
        rewardCoins,
        rewardXp,
        dueDate,
        createdAt,
        createdAt,
        null,
      );
    }
  }

  const hasPara = db
    .prepare("SELECT 1 FROM para_items WHERE device_id = ? LIMIT 1")
    .get(deviceId);

  if (!hasPara) {
    const insert = db.prepare(`
      INSERT INTO para_items (
        id, device_id, title, bucket, status, next_action, notes, due_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdAt = now();
    const defaults = [
      [
        "Projeto app RPG da Vida",
        "projects",
        "active",
        "Implementar módulo de metas",
        "Roadmap da semana",
        null,
      ],
      [
        "Área: Saúde",
        "areas",
        "active",
        "Treinar 4x semana",
        "Monitorar sono e alimentação",
        null,
      ],
      [
        "Recurso: Livro Hábitos Atômicos",
        "resources",
        "active",
        "Ler capítulo 3",
        "Anotar insights",
        null,
      ],
    ];

    for (const [
      title,
      bucket,
      status,
      nextAction,
      notes,
      dueDate,
    ] of defaults) {
      insert.run(
        createId(),
        deviceId,
        title,
        bucket,
        status,
        nextAction,
        notes,
        dueDate,
        createdAt,
        createdAt,
      );
    }
  }

  const hasJournal = db
    .prepare("SELECT 1 FROM journal_entries WHERE device_id = ? LIMIT 1")
    .get(deviceId);

  if (!hasJournal) {
    const createdAt = now();
    db.prepare(
      `
      INSERT INTO journal_entries (id, device_id, title, content, mood, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      createId(),
      deviceId,
      "Primeira entrada",
      "Hoje comecei a transformar minha rotina em jogo.",
      "motivated",
      "inicio,rotina",
      createdAt,
      createdAt,
    );
  }

  const hasInvestments = db
    .prepare("SELECT 1 FROM investments WHERE device_id = ? LIMIT 1")
    .get(deviceId);

  if (!hasInvestments) {
    const createdAt = now();
    db.prepare(
      `
      INSERT INTO investments (
        id, device_id, title, invested_coins, current_value, monthly_yield_percent, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      createId(),
      deviceId,
      "Reserva de emergência",
      50,
      50,
      0.8,
      "Aporte mensal constante",
      createdAt,
      createdAt,
    );
  }
}

export function getSetting(deviceId, key) {
  const stmt = db.prepare(
    "SELECT value FROM settings WHERE device_id = ? AND key = ?",
  );
  const row = stmt.get(deviceId, key);

  if (!row) return null;

  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
}

export function setSetting(deviceId, key, value) {
  const stmt = db.prepare(`
    INSERT INTO settings (device_id, key, value, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(device_id, key)
    DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `);

  stmt.run(deviceId, key, JSON.stringify(value), Date.now());
}

export function getProfile(deviceId) {
  ensureSeedData(deviceId);
  const row = db
    .prepare("SELECT * FROM profile WHERE device_id = ?")
    .get(deviceId);

  return row ?? null;
}

export function upsertProfile(deviceId, payload) {
  const stmt = db.prepare(`
    INSERT INTO profile (
      device_id, username, level, coins, hp_total, hp_current,
      main_objective, secondary_objective, strengths, weaknesses,
      goals_completion, xp_current, xp_target, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(device_id)
    DO UPDATE SET
      username = excluded.username,
      level = excluded.level,
      coins = excluded.coins,
      hp_total = excluded.hp_total,
      hp_current = excluded.hp_current,
      main_objective = excluded.main_objective,
      secondary_objective = excluded.secondary_objective,
      strengths = excluded.strengths,
      weaknesses = excluded.weaknesses,
      goals_completion = excluded.goals_completion,
      xp_current = excluded.xp_current,
      xp_target = excluded.xp_target,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    deviceId,
    payload?.username?.trim() || "Sem nome",
    toInteger(payload?.level, 1),
    toInteger(payload?.coins, 0),
    Math.max(toInteger(payload?.hp_total, 100), 100),
    Math.max(toInteger(payload?.hp_current, 0), 0),
    payload?.main_objective ?? "",
    payload?.secondary_objective ?? "",
    payload?.strengths ?? "",
    payload?.weaknesses ?? "",
    Math.min(Math.max(toInteger(payload?.goals_completion, 0), 0), 100),
    Math.max(toInteger(payload?.xp_current, 0), 0),
    Math.max(toInteger(payload?.xp_target, 1), 1),
    now(),
  );

  return getProfile(deviceId);
}

export function applyProfileProgress(
  deviceId,
  { coinsDelta = 0, xpDelta = 0, hpDelta = 0 },
) {
  const profile = getProfile(deviceId);
  if (!profile) return null;

  let nextCoins = Math.max(
    0,
    toInteger(profile.coins, 0) + toInteger(coinsDelta, 0),
  );
  let nextHp = Math.max(
    0,
    Math.min(
      toInteger(profile.hp_total, 100),
      toInteger(profile.hp_current, 0) + toInteger(hpDelta, 0),
    ),
  );

  let nextLevel = Math.max(1, toInteger(profile.level, 1));
  let nextXpTarget = Math.max(1, toInteger(profile.xp_target, 1));
  let nextXpCurrent = Math.max(
    0,
    toInteger(profile.xp_current, 0) + toInteger(xpDelta, 0),
  );

  while (nextXpCurrent >= nextXpTarget) {
    nextXpCurrent -= nextXpTarget;
    nextLevel += 1;
    nextXpTarget = Math.round(nextXpTarget * 1.15);
  }

  upsertProfile(deviceId, {
    ...profile,
    coins: nextCoins,
    hp_current: nextHp,
    level: nextLevel,
    xp_current: nextXpCurrent,
    xp_target: nextXpTarget,
  });

  return getProfile(deviceId);
}

export function listSkills(deviceId) {
  ensureSeedData(deviceId);
  return db
    .prepare(
      "SELECT id, title, current_xp, target_xp, level, created_at, updated_at FROM skills WHERE device_id = ? ORDER BY created_at DESC",
    )
    .all(deviceId);
}

export function createSkill(deviceId, payload) {
  const stmt = db.prepare(`
    INSERT INTO skills (id, device_id, title, current_xp, target_xp, level, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const timestamp = now();
  const id = createId();

  stmt.run(
    id,
    deviceId,
    payload?.title?.trim() || "Nova Skill",
    Math.max(toInteger(payload?.current_xp, 0), 0),
    Math.max(toInteger(payload?.target_xp, 1), 1),
    Math.max(toInteger(payload?.level, 1), 1),
    timestamp,
    timestamp,
  );

  return db.prepare("SELECT * FROM skills WHERE id = ?").get(id);
}

export function updateSkill(deviceId, id, payload) {
  const current = db
    .prepare("SELECT * FROM skills WHERE id = ? AND device_id = ?")
    .get(id, deviceId);

  if (!current) return null;

  const stmt = db.prepare(`
    UPDATE skills
    SET title = ?, current_xp = ?, target_xp = ?, level = ?, updated_at = ?
    WHERE id = ? AND device_id = ?
  `);

  stmt.run(
    payload?.title?.trim() || current.title,
    Math.max(toInteger(payload?.current_xp, current.current_xp), 0),
    Math.max(toInteger(payload?.target_xp, current.target_xp), 1),
    Math.max(toInteger(payload?.level, current.level), 1),
    now(),
    id,
    deviceId,
  );

  return db
    .prepare("SELECT * FROM skills WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
}

export function addSkillXp(deviceId, id, xpAmount = 1) {
  const current = db
    .prepare("SELECT * FROM skills WHERE id = ? AND device_id = ?")
    .get(id, deviceId);

  if (!current) return null;

  let currentXp = Math.max(0, toInteger(current.current_xp, 0));
  let targetXp = Math.max(1, toInteger(current.target_xp, 1));
  let level = Math.max(1, toInteger(current.level, 1));
  const gain = Math.max(1, toInteger(xpAmount, 1));

  currentXp += gain;

  while (currentXp >= targetXp) {
    currentXp -= targetXp;
    level += 1;
    targetXp = Math.round(targetXp * 1.2);
  }

  db.prepare(
    `
    UPDATE skills
    SET current_xp = ?, target_xp = ?, level = ?, updated_at = ?
    WHERE id = ? AND device_id = ?
  `,
  ).run(currentXp, targetXp, level, now(), id, deviceId);

  const profile = applyProfileProgress(deviceId, { xpDelta: gain });

  createActivity(deviceId, {
    title: `Skill treinada: ${current.title}`,
    status: "won",
    description: "Você ganhou experiência na skill e no nível geral.",
    values_text: `+${gain} XP (skill e geral)`,
  });

  return {
    skill: db
      .prepare("SELECT * FROM skills WHERE id = ? AND device_id = ?")
      .get(id, deviceId),
    profile,
  };
}

export function deleteSkill(deviceId, id) {
  const stmt = db.prepare("DELETE FROM skills WHERE id = ? AND device_id = ?");
  return stmt.run(id, deviceId).changes > 0;
}

export function listTasks(deviceId) {
  ensureSeedData(deviceId);
  return db
    .prepare(
      "SELECT id, title, level, status, due_label, created_at, updated_at FROM tasks WHERE device_id = ? ORDER BY created_at DESC",
    )
    .all(deviceId);
}

export function createTask(deviceId, payload) {
  const stmt = db.prepare(`
    INSERT INTO tasks (id, device_id, title, level, status, due_label, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const timestamp = now();
  const id = createId();
  stmt.run(
    id,
    deviceId,
    payload?.title?.trim() || "Nova tarefa",
    Math.max(toInteger(payload?.level, 1), 1),
    payload?.status === "CONCLUÍDO" ? "CONCLUÍDO" : "A FAZER",
    payload?.due_label?.trim() || null,
    timestamp,
    timestamp,
  );

  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
}

export function updateTask(deviceId, id, payload) {
  const current = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
  if (!current) return null;

  const stmt = db.prepare(`
    UPDATE tasks
    SET title = ?, level = ?, status = ?, due_label = ?, updated_at = ?
    WHERE id = ? AND device_id = ?
  `);

  stmt.run(
    payload?.title?.trim() || current.title,
    Math.max(toInteger(payload?.level, current.level), 1),
    payload?.status === "CONCLUÍDO" ? "CONCLUÍDO" : "A FAZER",
    payload?.due_label?.trim() || null,
    now(),
    id,
    deviceId,
  );

  return db
    .prepare("SELECT * FROM tasks WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
}

export function deleteTask(deviceId, id) {
  const stmt = db.prepare("DELETE FROM tasks WHERE id = ? AND device_id = ?");
  return stmt.run(id, deviceId).changes > 0;
}

export function listActivities(deviceId) {
  ensureSeedData(deviceId);
  return db
    .prepare(
      "SELECT id, title, status, description, values_text, created_at, updated_at FROM activities WHERE device_id = ? ORDER BY created_at DESC",
    )
    .all(deviceId);
}

export function createActivity(deviceId, payload) {
  const stmt = db.prepare(`
    INSERT INTO activities (id, device_id, title, status, description, values_text, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const timestamp = now();
  const id = createId();

  stmt.run(
    id,
    deviceId,
    payload?.title?.trim() || null,
    ["won", "lost", "limit"].includes(payload?.status) ? payload.status : "won",
    payload?.description?.trim() || "Nova atividade",
    payload?.values_text?.trim() || null,
    timestamp,
    timestamp,
  );

  return db.prepare("SELECT * FROM activities WHERE id = ?").get(id);
}

export function updateActivity(deviceId, id, payload) {
  const current = db
    .prepare("SELECT * FROM activities WHERE id = ? AND device_id = ?")
    .get(id, deviceId);

  if (!current) return null;

  const stmt = db.prepare(`
    UPDATE activities
    SET title = ?, status = ?, description = ?, values_text = ?, updated_at = ?
    WHERE id = ? AND device_id = ?
  `);

  stmt.run(
    payload?.title?.trim() || null,
    ["won", "lost", "limit"].includes(payload?.status)
      ? payload.status
      : current.status,
    payload?.description?.trim() || current.description,
    payload?.values_text?.trim() || null,
    now(),
    id,
    deviceId,
  );

  return db
    .prepare("SELECT * FROM activities WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
}

export function deleteActivity(deviceId, id) {
  const stmt = db.prepare(
    "DELETE FROM activities WHERE id = ? AND device_id = ?",
  );
  return stmt.run(id, deviceId).changes > 0;
}

export function listHabits(deviceId, type = null) {
  ensureSeedData(deviceId);

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = now() - 7 * 24 * 60 * 60 * 1000;
  const dayStartMs = dayStart.getTime();

  const baseQuery = `
    SELECT
      h.*,
      (
        SELECT COUNT(*)
        FROM habit_completions hc
        WHERE hc.habit_id = h.id AND hc.device_id = h.device_id
      ) AS completions_total,
      (
        SELECT COUNT(*)
        FROM habit_completions hc
        WHERE hc.habit_id = h.id AND hc.device_id = h.device_id AND hc.completed_at >= ?
      ) AS completions_7d,
      (
        SELECT COUNT(*)
        FROM habit_completions hc
        WHERE hc.habit_id = h.id AND hc.device_id = h.device_id AND hc.completed_at >= ?
      ) AS completions_today,
      (
        SELECT MAX(hc.completed_at)
        FROM habit_completions hc
        WHERE hc.habit_id = h.id AND hc.device_id = h.device_id
      ) AS last_completed_at
    FROM habits h
    WHERE h.device_id = ?
  `;

  if (!type) {
    return db
      .prepare(`${baseQuery} ORDER BY h.created_at DESC`)
      .all(sevenDaysAgo, dayStartMs, deviceId);
  }

  return db
    .prepare(`${baseQuery} AND h.type = ? ORDER BY h.created_at DESC`)
    .all(sevenDaysAgo, dayStartMs, deviceId, type);
}

export function createHabit(deviceId, payload) {
  const habitType = payload?.type === "bad" ? "bad" : "good";
  const stmt = db.prepare(`
    INSERT INTO habits (
      id, device_id, title, type, frequency, reward_coins, damage_hp, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const timestamp = now();
  const id = createId();
  stmt.run(
    id,
    deviceId,
    payload?.title?.trim() || "Novo hábito",
    habitType,
    ["daily", "weekly", "monthly"].includes(payload?.frequency)
      ? payload.frequency
      : "daily",
    habitType === "good" ? Math.max(toInteger(payload?.reward_coins, 1), 1) : 0,
    habitType === "bad" ? Math.max(toInteger(payload?.damage_hp, 1), 1) : 0,
    payload?.active === 0 ? 0 : 1,
    timestamp,
    timestamp,
  );

  return db.prepare("SELECT * FROM habits WHERE id = ?").get(id);
}

export function updateHabit(deviceId, id, payload) {
  const current = db
    .prepare("SELECT * FROM habits WHERE id = ? AND device_id = ?")
    .get(id, deviceId);

  if (!current) return null;

  const type =
    payload?.type === "bad" || payload?.type === "good"
      ? payload.type
      : current.type;

  db.prepare(
    `
    UPDATE habits
    SET title = ?, type = ?, frequency = ?, reward_coins = ?, damage_hp = ?, active = ?, updated_at = ?
    WHERE id = ? AND device_id = ?
  `,
  ).run(
    payload?.title?.trim() || current.title,
    type,
    ["daily", "weekly", "monthly"].includes(payload?.frequency)
      ? payload.frequency
      : current.frequency,
    type === "good"
      ? Math.max(toInteger(payload?.reward_coins, current.reward_coins), 1)
      : 0,
    type === "bad"
      ? Math.max(toInteger(payload?.damage_hp, current.damage_hp), 1)
      : 0,
    payload?.active === 0 ? 0 : 1,
    now(),
    id,
    deviceId,
  );

  return db
    .prepare("SELECT * FROM habits WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
}

export function deleteHabit(deviceId, id) {
  return (
    db
      .prepare("DELETE FROM habits WHERE id = ? AND device_id = ?")
      .run(id, deviceId).changes > 0
  );
}

export function completeHabit(deviceId, habitId) {
  ensureSeedData(deviceId);

  const habit = db
    .prepare("SELECT * FROM habits WHERE id = ? AND device_id = ?")
    .get(habitId, deviceId);

  if (!habit) return null;

  const timestamp = now();

  db.prepare(
    "INSERT INTO habit_completions (id, device_id, habit_id, completed_at, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(createId(), deviceId, habitId, timestamp, timestamp);

  const xpByFrequency = {
    daily: 5,
    weekly: 12,
    monthly: 25,
  };

  const xpReward = xpByFrequency[habit.frequency] ?? 5;
  let profile = getProfile(deviceId);

  if (habit.type === "good") {
    profile = applyProfileProgress(deviceId, {
      coinsDelta: habit.reward_coins,
      xpDelta: xpReward,
    });
    createActivity(deviceId, {
      title: `Hábito concluído: ${habit.title}`,
      status: "won",
      description: `Você concluiu um bom hábito (${habit.frequency})`,
      values_text: `+${habit.reward_coins} moedas • +${xpReward} XP`,
    });
  } else {
    profile = applyProfileProgress(deviceId, {
      hpDelta: -habit.damage_hp,
      xpDelta: -2,
    });
    createActivity(deviceId, {
      title: `Mau hábito registrado: ${habit.title}`,
      status: "lost",
      description: `Penalidade aplicada por mau hábito (${habit.frequency})`,
      values_text: `-${habit.damage_hp} HP • -2 XP`,
    });
  }

  return {
    habit,
    profile,
  };
}

export function listMarketItems(deviceId) {
  ensureSeedData(deviceId);
  return db
    .prepare(
      "SELECT * FROM market_items WHERE device_id = ? ORDER BY created_at DESC",
    )
    .all(deviceId);
}

export function createMarketItem(deviceId, payload) {
  const timestamp = now();
  const id = createId();

  db.prepare(
    `
    INSERT INTO market_items (
      id, device_id, title, cost_coins, description, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    deviceId,
    payload?.title?.trim() || "Nova recompensa",
    Math.max(toInteger(payload?.cost_coins, 1), 1),
    payload?.description?.trim() || "",
    payload?.active === 0 ? 0 : 1,
    timestamp,
    timestamp,
  );

  return db.prepare("SELECT * FROM market_items WHERE id = ?").get(id);
}

export function updateMarketItem(deviceId, id, payload) {
  const current = db
    .prepare("SELECT * FROM market_items WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
  if (!current) return null;

  db.prepare(
    `
    UPDATE market_items
    SET title = ?, cost_coins = ?, description = ?, active = ?, updated_at = ?
    WHERE id = ? AND device_id = ?
  `,
  ).run(
    payload?.title?.trim() || current.title,
    Math.max(toInteger(payload?.cost_coins, current.cost_coins), 1),
    payload?.description?.trim() ?? current.description,
    payload?.active === 0 ? 0 : 1,
    now(),
    id,
    deviceId,
  );

  return db
    .prepare("SELECT * FROM market_items WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
}

export function deleteMarketItem(deviceId, id) {
  return (
    db
      .prepare("DELETE FROM market_items WHERE id = ? AND device_id = ?")
      .run(id, deviceId).changes > 0
  );
}

export function redeemMarketItem(deviceId, itemId) {
  ensureSeedData(deviceId);

  const item = db
    .prepare("SELECT * FROM market_items WHERE id = ? AND device_id = ?")
    .get(itemId, deviceId);
  if (!item || item.active !== 1)
    return { ok: false, reason: "ITEM_NOT_FOUND" };

  let profile = getProfile(deviceId);
  if (toInteger(profile?.coins, 0) < item.cost_coins) {
    return { ok: false, reason: "INSUFFICIENT_COINS" };
  }

  const timestamp = now();
  db.prepare(
    "INSERT INTO market_redemptions (id, device_id, item_id, cost_coins, redeemed_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(createId(), deviceId, itemId, item.cost_coins, timestamp, timestamp);

  profile = applyProfileProgress(deviceId, {
    coinsDelta: -item.cost_coins,
    xpDelta: 1,
  });

  createActivity(deviceId, {
    title: `Mercado: ${item.title}`,
    status: "limit",
    description: "Você trocou moedas por uma recompensa pessoal.",
    values_text: `-${item.cost_coins} moedas`,
  });

  return { ok: true, profile };
}

export function getMetrics(deviceId, days = 30) {
  ensureSeedData(deviceId);
  const limitDate =
    now() - Math.max(toInteger(days, 30), 1) * 24 * 60 * 60 * 1000;

  const completions = db
    .prepare(
      `
      SELECT h.type AS type, COUNT(*) AS total
      FROM habit_completions hc
      INNER JOIN habits h ON h.id = hc.habit_id
      WHERE hc.device_id = ? AND hc.completed_at >= ?
      GROUP BY h.type
      `,
    )
    .all(deviceId, limitDate);

  const goodRow = completions.find((row) => row.type === "good");
  const badRow = completions.find((row) => row.type === "bad");

  const coinsEarned = db
    .prepare(
      `
      SELECT COALESCE(SUM(h.reward_coins), 0) AS total
      FROM habit_completions hc
      INNER JOIN habits h ON h.id = hc.habit_id
      WHERE hc.device_id = ? AND hc.completed_at >= ? AND h.type = 'good'
      `,
    )
    .get(deviceId, limitDate)?.total;

  const hpLost = db
    .prepare(
      `
      SELECT COALESCE(SUM(h.damage_hp), 0) AS total
      FROM habit_completions hc
      INNER JOIN habits h ON h.id = hc.habit_id
      WHERE hc.device_id = ? AND hc.completed_at >= ? AND h.type = 'bad'
      `,
    )
    .get(deviceId, limitDate)?.total;

  const redemptions = db
    .prepare(
      "SELECT COUNT(*) AS total, COALESCE(SUM(cost_coins), 0) AS spent FROM market_redemptions WHERE device_id = ? AND redeemed_at >= ?",
    )
    .get(deviceId, limitDate);

  return {
    periodDays: Math.max(toInteger(days, 30), 1),
    goodHabitsCompleted: toInteger(goodRow?.total, 0),
    badHabitsLogged: toInteger(badRow?.total, 0),
    coinsEarned: toInteger(coinsEarned, 0),
    hpLost: toInteger(hpLost, 0),
    redemptionsCount: toInteger(redemptions?.total, 0),
    coinsSpent: toInteger(redemptions?.spent, 0),
    profile: getProfile(deviceId),
  };
}

export function listGoals(deviceId) {
  ensureSeedData(deviceId);
  return db
    .prepare("SELECT * FROM goals WHERE device_id = ? ORDER BY created_at DESC")
    .all(deviceId);
}

export function createGoal(deviceId, payload) {
  const timestamp = now();
  const id = createId();

  db.prepare(
    `
    INSERT INTO goals (
      id, device_id, title, category, status, target_value, current_value,
      reward_coins, reward_xp, due_date, created_at, updated_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    deviceId,
    payload?.title?.trim() || "Nova meta",
    payload?.category?.trim() || "geral",
    "in_progress",
    Math.max(toInteger(payload?.target_value, 1), 1),
    Math.max(toInteger(payload?.current_value, 0), 0),
    Math.max(toInteger(payload?.reward_coins, 10), 0),
    Math.max(toInteger(payload?.reward_xp, 10), 0),
    payload?.due_date || null,
    timestamp,
    timestamp,
    null,
  );

  return db.prepare("SELECT * FROM goals WHERE id = ?").get(id);
}

export function updateGoal(deviceId, id, payload) {
  const current = db
    .prepare("SELECT * FROM goals WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
  if (!current) return null;

  const targetValue = Math.max(
    toInteger(payload?.target_value, current.target_value),
    1,
  );
  const currentValue = Math.min(
    Math.max(toInteger(payload?.current_value, current.current_value), 0),
    targetValue,
  );

  db.prepare(
    `
    UPDATE goals
    SET title = ?, category = ?, status = ?, target_value = ?, current_value = ?,
        reward_coins = ?, reward_xp = ?, due_date = ?, updated_at = ?
    WHERE id = ? AND device_id = ?
  `,
  ).run(
    payload?.title?.trim() || current.title,
    payload?.category?.trim() || current.category,
    payload?.status === "done" ? "done" : "in_progress",
    targetValue,
    currentValue,
    Math.max(toInteger(payload?.reward_coins, current.reward_coins), 0),
    Math.max(toInteger(payload?.reward_xp, current.reward_xp), 0),
    payload?.due_date ?? current.due_date,
    now(),
    id,
    deviceId,
  );

  return db
    .prepare("SELECT * FROM goals WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
}

export function deleteGoal(deviceId, id) {
  return (
    db
      .prepare("DELETE FROM goals WHERE id = ? AND device_id = ?")
      .run(id, deviceId).changes > 0
  );
}

export function completeGoal(deviceId, id) {
  const goal = db
    .prepare("SELECT * FROM goals WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
  if (!goal) return null;
  if (goal.status === "done") return { goal, profile: getProfile(deviceId) };

  db.prepare(
    "UPDATE goals SET status = 'done', current_value = target_value, updated_at = ?, completed_at = ? WHERE id = ? AND device_id = ?",
  ).run(now(), now(), id, deviceId);

  const profile = applyProfileProgress(deviceId, {
    coinsDelta: goal.reward_coins,
    xpDelta: goal.reward_xp,
    hpDelta: 5,
  });

  createActivity(deviceId, {
    title: `Meta concluída: ${goal.title}`,
    status: "won",
    description: "Parabéns por alcançar a meta!",
    values_text: `+${goal.reward_coins} moedas • +${goal.reward_xp} XP`,
  });

  return { goal: { ...goal, status: "done" }, profile };
}

export function syncAppleHealthSteps(deviceId, steps) {
  ensureSeedData(deviceId);

  const parsedSteps = toInteger(steps, 0);
  if (parsedSteps <= 0) return { ok: false, reason: "NO_STEPS" };

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayStartMs = dayStart.getTime();

  const alreadySynced = db
    .prepare(
      `
    SELECT * FROM activities 
    WHERE device_id = ? AND title = 'Sincronização Apple Health' 
    AND created_at >= ? LIMIT 1
  `,
    )
    .get(deviceId, dayStartMs);

  if (alreadySynced) {
    return { ok: false, reason: "ALREADY_SYNCED_TODAY" };
  }

  const xpReward = Math.min(30, Math.floor(parsedSteps / 1000) * 3);
  const goldReward = Math.min(15, Math.floor(parsedSteps / 2000) * 2);

  if (xpReward <= 0 && goldReward <= 0)
    return { ok: false, reason: "NOT_ENOUGH_STEPS" };

  const profile = applyProfileProgress(deviceId, {
    coinsDelta: goldReward,
    xpDelta: xpReward,
  });

  createActivity(deviceId, {
    title: "Sincronização Apple Health",
    status: "won",
    description: `Você sincronizou ${parsedSteps} passos do seu celular hoje!`,
    values_text: `+${goldReward} moedas • +${xpReward} XP`,
  });

  return { ok: true, profile, xpReward, goldReward };
}

export function listParaItems(deviceId) {
  ensureSeedData(deviceId);
  return db
    .prepare(
      "SELECT * FROM para_items WHERE device_id = ? ORDER BY created_at DESC",
    )
    .all(deviceId);
}

export function createParaItem(deviceId, payload) {
  const timestamp = now();
  const id = createId();
  db.prepare(
    `
    INSERT INTO para_items (
      id, device_id, title, bucket, status, next_action, notes, due_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    deviceId,
    payload?.title?.trim() || "Novo item PARA",
    ["projects", "areas", "resources", "archive"].includes(payload?.bucket)
      ? payload.bucket
      : "projects",
    ["idea", "active", "waiting", "done"].includes(payload?.status)
      ? payload.status
      : "idea",
    payload?.next_action?.trim() || "",
    payload?.notes?.trim() || "",
    payload?.due_date || null,
    timestamp,
    timestamp,
  );

  return db.prepare("SELECT * FROM para_items WHERE id = ?").get(id);
}

export function updateParaItem(deviceId, id, payload) {
  const current = db
    .prepare("SELECT * FROM para_items WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
  if (!current) return null;

  db.prepare(
    `
    UPDATE para_items
    SET title = ?, bucket = ?, status = ?, next_action = ?, notes = ?, due_date = ?, updated_at = ?
    WHERE id = ? AND device_id = ?
  `,
  ).run(
    payload?.title?.trim() || current.title,
    ["projects", "areas", "resources", "archive"].includes(payload?.bucket)
      ? payload.bucket
      : current.bucket,
    ["idea", "active", "waiting", "done"].includes(payload?.status)
      ? payload.status
      : current.status,
    payload?.next_action?.trim() ?? current.next_action,
    payload?.notes?.trim() ?? current.notes,
    payload?.due_date ?? current.due_date,
    now(),
    id,
    deviceId,
  );

  if (payload?.status === "done" && current.status !== "done") {
    applyProfileProgress(deviceId, { xpDelta: 12, hpDelta: 3 });
    createActivity(deviceId, {
      title: `PARA concluído: ${current.title}`,
      status: "won",
      description: "Você moveu um item do método PARA para concluído.",
      values_text: "+12 XP • +3 HP",
    });
  }

  return db
    .prepare("SELECT * FROM para_items WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
}

export function deleteParaItem(deviceId, id) {
  return (
    db
      .prepare("DELETE FROM para_items WHERE id = ? AND device_id = ?")
      .run(id, deviceId).changes > 0
  );
}

export function listJournalEntries(deviceId) {
  ensureSeedData(deviceId);
  return db
    .prepare(
      "SELECT * FROM journal_entries WHERE device_id = ? ORDER BY created_at DESC",
    )
    .all(deviceId);
}

export function createJournalEntry(deviceId, payload) {
  const timestamp = now();
  const id = createId();

  db.prepare(
    `
    INSERT INTO journal_entries (id, device_id, title, content, mood, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    deviceId,
    payload?.title?.trim() || null,
    payload?.content?.trim() || "",
    payload?.mood?.trim() || "neutral",
    payload?.tags?.trim() || "",
    timestamp,
    timestamp,
  );

  applyProfileProgress(deviceId, { xpDelta: 4 });

  return db.prepare("SELECT * FROM journal_entries WHERE id = ?").get(id);
}

export function updateJournalEntry(deviceId, id, payload) {
  const current = db
    .prepare("SELECT * FROM journal_entries WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
  if (!current) return null;

  db.prepare(
    `
    UPDATE journal_entries
    SET title = ?, content = ?, mood = ?, tags = ?, updated_at = ?
    WHERE id = ? AND device_id = ?
  `,
  ).run(
    payload?.title?.trim() || null,
    payload?.content?.trim() || current.content,
    payload?.mood?.trim() || current.mood,
    payload?.tags?.trim() || current.tags,
    now(),
    id,
    deviceId,
  );

  return db
    .prepare("SELECT * FROM journal_entries WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
}

export function deleteJournalEntry(deviceId, id) {
  return (
    db
      .prepare("DELETE FROM journal_entries WHERE id = ? AND device_id = ?")
      .run(id, deviceId).changes > 0
  );
}

export function listInvestments(deviceId) {
  ensureSeedData(deviceId);
  return db
    .prepare(
      "SELECT * FROM investments WHERE device_id = ? ORDER BY created_at DESC",
    )
    .all(deviceId);
}

export function createInvestment(deviceId, payload) {
  const timestamp = now();
  const id = createId();

  const invested = Math.max(toInteger(payload?.invested_coins, 0), 0);
  const currentValue = Math.max(
    toInteger(payload?.current_value, invested),
    invested,
  );

  db.prepare(
    `
    INSERT INTO investments (
      id, device_id, title, invested_coins, current_value, monthly_yield_percent, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    deviceId,
    payload?.title?.trim() || "Novo investimento",
    invested,
    currentValue,
    Number(payload?.monthly_yield_percent) || 0,
    payload?.notes?.trim() || "",
    timestamp,
    timestamp,
  );

  return db.prepare("SELECT * FROM investments WHERE id = ?").get(id);
}

export function updateInvestment(deviceId, id, payload) {
  const current = db
    .prepare("SELECT * FROM investments WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
  if (!current) return null;

  db.prepare(
    `
    UPDATE investments
    SET title = ?, invested_coins = ?, current_value = ?, monthly_yield_percent = ?, notes = ?, updated_at = ?
    WHERE id = ? AND device_id = ?
  `,
  ).run(
    payload?.title?.trim() || current.title,
    Math.max(toInteger(payload?.invested_coins, current.invested_coins), 0),
    Math.max(toInteger(payload?.current_value, current.current_value), 0),
    Number(payload?.monthly_yield_percent ?? current.monthly_yield_percent),
    payload?.notes?.trim() ?? current.notes,
    now(),
    id,
    deviceId,
  );

  return db
    .prepare("SELECT * FROM investments WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
}

export function deleteInvestment(deviceId, id) {
  return (
    db
      .prepare("DELETE FROM investments WHERE id = ? AND device_id = ?")
      .run(id, deviceId).changes > 0
  );
}

export function contributeInvestment(deviceId, id, coinsAmount) {
  const investment = db
    .prepare("SELECT * FROM investments WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
  if (!investment) return { ok: false, reason: "INVESTMENT_NOT_FOUND" };

  const amount = Math.max(toInteger(coinsAmount, 0), 1);
  const profile = getProfile(deviceId);
  if (toInteger(profile?.coins, 0) < amount) {
    return { ok: false, reason: "INSUFFICIENT_COINS" };
  }

  applyProfileProgress(deviceId, { coinsDelta: -amount, xpDelta: 6 });

  db.prepare(
    "UPDATE investments SET invested_coins = invested_coins + ?, current_value = current_value + ?, updated_at = ? WHERE id = ? AND device_id = ?",
  ).run(amount, amount, now(), id, deviceId);

  createActivity(deviceId, {
    title: `Aporte em investimento: ${investment.title}`,
    status: "limit",
    description: "Você converteu moedas em aporte financeiro.",
    values_text: `-${amount} moedas • +6 XP`,
  });

  return {
    ok: true,
    investment: db
      .prepare("SELECT * FROM investments WHERE id = ? AND device_id = ?")
      .get(id, deviceId),
    profile: getProfile(deviceId),
  };
}

export function applyInvestmentYield(deviceId, id) {
  const investment = db
    .prepare("SELECT * FROM investments WHERE id = ? AND device_id = ?")
    .get(id, deviceId);
  if (!investment) return { ok: false, reason: "INVESTMENT_NOT_FOUND" };

  const gain = Math.max(
    1,
    Math.round(
      (Number(investment.monthly_yield_percent || 0) / 100) *
        investment.current_value,
    ),
  );

  db.prepare(
    "UPDATE investments SET current_value = current_value + ?, updated_at = ? WHERE id = ? AND device_id = ?",
  ).run(gain, now(), id, deviceId);

  applyProfileProgress(deviceId, { xpDelta: 4 });

  createActivity(deviceId, {
    title: `Rendimento aplicado: ${investment.title}`,
    status: "won",
    description: "Seu investimento teve atualização de rendimento.",
    values_text: `+${gain} valor investido • +4 XP`,
  });

  return {
    ok: true,
    gain,
    investment: db
      .prepare("SELECT * FROM investments WHERE id = ? AND device_id = ?")
      .get(id, deviceId),
  };
}
