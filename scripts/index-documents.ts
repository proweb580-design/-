import { ragConfig } from "../lib/rag/config";
import { reindex } from "../lib/rag/knowledge-base";

async function main() {
  const reports = await reindex();
  for (const r of reports) {
    console.log(`Папка: ${ragConfig.documentsDir}`);
    console.log(
      `Добавлено: ${r.added.length}, обновлено: ${r.updated.length}, удалено: ${r.removed.length}, без изменений: ${r.unchanged}`,
    );
    for (const f of r.failed) console.warn(`Не удалось прочитать ${f.name}: ${f.error}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
