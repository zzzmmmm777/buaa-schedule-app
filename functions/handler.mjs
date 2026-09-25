const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" },
});

const MAX_BODY = 4096;
const MAX_TITLE = 60;
const MAX_LOC = 40;
const MAX_NOTE = 200;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const DB_COLS = "id,title,date,todo_time,loc,note,done,created_at";

async function readBody(request) {
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try {
    const obj = JSON.parse(text);
    return (obj && typeof obj === "object" && !Array.isArray(obj)) ? obj : null;
  } catch { return null; }
}

function validateString(v, maxLen) {
  return typeof v === "string" && v.length > 0 && v.length <= maxLen;
}

function optionalString(v, maxLen) {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed.length <= maxLen ? (trimmed || null) : undefined;
}

function toApiItem(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.todo_time || null,
    loc: row.loc || null,
    note: row.note || null,
    done: !!row.done,
    created_at: row.created_at,
  };
}

export async function handleTodos({ request, supabase }) {
  const params = new URL(request.url).searchParams;
  const action = params.get("action");
  const method = request.method;

  if (method === "GET") {
    if (action !== "list") return json({ error: "not_found" }, 404);
    try {
      const { data, error } = await supabase.from("todos")
        .select(DB_COLS)
        .order("created_at", { ascending: true });
      if (error || !Array.isArray(data)) return json({ error: "database_request_failed" }, 503);
      return json({ items: data.map(toApiItem) });
    } catch {
      return json({ error: "database_request_failed" }, 503);
    }
  }

  if (method !== "POST") return json({ error: "method_not_allowed" }, 405, { allow: "GET, POST" });

  const body = await readBody(request);
  if (!body) return json({ error: "invalid_body" }, 400);

  if (action === "create") {
    if (!validateString(body.title, MAX_TITLE)) return json({ error: "invalid_title" }, 400);
    if (!DATE_RE.test(body.date)) return json({ error: "invalid_date" }, 400);
    if (body.time !== null && body.time !== undefined && !TIME_RE.test(body.time)) return json({ error: "invalid_time" }, 400);
    const loc = optionalString(body.loc, MAX_LOC);
    const note = optionalString(body.note, MAX_NOTE);
    if (loc === undefined) return json({ error: "invalid_loc" }, 400);
    if (note === undefined) return json({ error: "invalid_note" }, 400);

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const row = {
      id,
      title: body.title.trim(),
      date: body.date,
      todo_time: (body.time && TIME_RE.test(body.time)) ? body.time : null,
      loc,
      note,
      done: false,
      created_at,
    };
    try {
      const { data, error } = await supabase.from("todos").insert(row).select(DB_COLS).single();
      if (error || !data) return json({ error: "database_request_failed" }, 503);
      return json({ item: toApiItem(data) }, 201);
    } catch {
      return json({ error: "database_request_failed" }, 503);
    }
  }

  if (action === "update") {
    if (!UUID_RE.test(body.id)) return json({ error: "invalid_id" }, 400);
    const changes = {};
    if (body.title !== undefined) {
      if (!validateString(body.title, MAX_TITLE)) return json({ error: "invalid_title" }, 400);
      changes.title = body.title.trim();
    }
    if (body.date !== undefined) {
      if (!DATE_RE.test(body.date)) return json({ error: "invalid_date" }, 400);
      changes.date = body.date;
    }
    if (body.time !== undefined) {
      if (body.time !== null && !TIME_RE.test(body.time)) return json({ error: "invalid_time" }, 400);
      changes.todo_time = body.time;
    }
    if (body.loc !== undefined) {
      const loc = optionalString(body.loc, MAX_LOC);
      if (loc === undefined) return json({ error: "invalid_loc" }, 400);
      changes.loc = loc;
    }
    if (body.note !== undefined) {
      const note = optionalString(body.note, MAX_NOTE);
      if (note === undefined) return json({ error: "invalid_note" }, 400);
      changes.note = note;
    }
    if (body.done !== undefined) {
      if (typeof body.done !== "boolean") return json({ error: "invalid_done" }, 400);
      changes.done = body.done;
    }
    if (Object.keys(changes).length === 0) return json({ error: "no_changes" }, 400);

    try {
      const { data, error } = await supabase.from("todos")
        .update(changes).eq("id", body.id)
        .select(DB_COLS).maybeSingle();
      if (error) return json({ error: "database_request_failed" }, 503);
      if (!data) return json({ error: "not_found" }, 404);
      return json({ item: toApiItem(data) });
    } catch {
      return json({ error: "database_request_failed" }, 503);
    }
  }

  if (action === "toggle") {
    if (!UUID_RE.test(body.id)) return json({ error: "invalid_id" }, 400);
    try {
      const { data: current, error: readErr } = await supabase.from("todos")
        .select("done").eq("id", body.id).maybeSingle();
      if (readErr || !current) return json({ error: readErr ? "database_request_failed" : "not_found" }, readErr ? 503 : 404);
      const { data, error } = await supabase.from("todos")
        .update({ done: !current.done }).eq("id", body.id)
        .select(DB_COLS).maybeSingle();
      if (error) return json({ error: "database_request_failed" }, 503);
      if (!data) return json({ error: "not_found" }, 404);
      return json({ item: toApiItem(data) });
    } catch {
      return json({ error: "database_request_failed" }, 503);
    }
  }

  if (action === "delete") {
    if (!UUID_RE.test(body.id)) return json({ error: "invalid_id" }, 400);
    try {
      const { data, error } = await supabase.from("todos")
        .delete().eq("id", body.id)
        .select("id").maybeSingle();
      if (error) return json({ error: "database_request_failed" }, 503);
      if (!data) return json({ error: "not_found" }, 404);
      return json({ ok: true });
    } catch {
      return json({ error: "database_request_failed" }, 503);
    }
  }

  return json({ error: "not_found" }, 404);
}
