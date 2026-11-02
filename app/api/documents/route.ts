import { getIndex, reindex } from "@/lib/rag/knowledge-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Список проиндексированных документов (для статуса базы знаний в чате). */
export async function GET() {
  try {
    const index = await getIndex();
    return Response.json({
      documents: index.docs.map(({ name, source, chunkCount, indexedAt }) => ({ name, source, chunkCount, indexedAt })),
    });
  } catch (error) {
    console.error("[documents]", error);
    return Response.json({ error: "Не удалось прочитать базу знаний" }, { status: 500 });
  }
}

/**
 * Переиндексация папки с документами. В продакшене доступна только с токеном
 * из REINDEX_TOKEN, локально (npm run dev) без него.
 */
export async function POST(request: Request) {
  const token = process.env.REINDEX_TOKEN;
  const allowed = token
    ? request.headers.get("authorization") === `Bearer ${token}`
    : process.env.NODE_ENV !== "production";
  if (!allowed) return Response.json({ error: "Нет доступа" }, { status: 403 });

  try {
    const reports = await reindex();
    return Response.json({ reports });
  } catch (error) {
    console.error("[documents:reindex]", error);
    return Response.json({ error: "Не удалось обновить базу знаний" }, { status: 500 });
  }
}
