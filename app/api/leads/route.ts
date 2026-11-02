import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { LEAD_COURSE_IDS } from "@/lib/courses";

export const runtime = "nodejs";

const LEADS_FILE = path.resolve(process.cwd(), "data", "leads.jsonl");

/**
 * Заявки на обучение. Пока сохраняются в локальный файл data/leads.jsonl;
 * отправку в CRM или на почту подключим отдельным шагом.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const course = typeof body.course === "string" ? body.course : "";
  const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 1000) : "";

  const errors: Record<string, string> = {};
  if (name.length < 2 || name.length > 80) errors.name = "Укажите имя";
  if (!/^\+?[\d\s()-]{9,20}$/.test(phone)) errors.phone = "Укажите телефон в формате +998 90 123 45 67";
  if (!(LEAD_COURSE_IDS as readonly string[]).includes(course)) errors.course = "Выберите направление";
  if (Object.keys(errors).length > 0) return Response.json({ errors }, { status: 422 });

  await mkdir(path.dirname(LEADS_FILE), { recursive: true });
  await appendFile(
    LEADS_FILE,
    `${JSON.stringify({ name, phone, course, comment, createdAt: new Date().toISOString() })}\n`,
    "utf8",
  );
  return Response.json({ ok: true }, { status: 201 });
}
