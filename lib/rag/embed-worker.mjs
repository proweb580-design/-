// Локальные эмбеддинги в отдельном процессе. Нативный onnxruntime может упасть
// с access violation (например, при устаревшем Visual C++ Redistributable на Windows);
// тогда завершается только этот процесс, а сайт продолжает работать.
import { env, pipeline } from "@huggingface/transformers";

const [model, cacheDir] = process.argv.slice(2);
env.cacheDir = cacheDir;

let extractor;

process.on("message", async ({ id, texts }) => {
  try {
    // Модель скачивается один раз (~120 МБ) и дальше работает офлайн.
    extractor ??= pipeline("feature-extraction", model, { dtype: "q8" });
    const run = await extractor;
    const output = await run(texts, { pooling: "mean", normalize: true });
    process.send({ id, vectors: output.tolist() });
  } catch (error) {
    extractor = undefined;
    process.send({ id, error: error instanceof Error ? error.message : String(error) });
  }
});
