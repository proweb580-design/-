// Одноразовая настройка: получает refresh token для Google Drive и записывает его в .env.
// Запуск: node scripts/google-drive-auth.mjs
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ENV_FILE = path.resolve(process.cwd(), ".env");
const PORT = 3333;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";

const env = await readEnv();
const clientId = env.GOOGLE_CLIENT_ID;
const clientSecret = env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("В .env не заполнены GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET.");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  });

const code = await waitForCode();
const token = await exchangeCode(code);
if (!token.refresh_token) {
  console.error("Google не вернул refresh_token. Отключите доступ приложения в аккаунте Google и повторите.");
  process.exit(1);
}
await saveRefreshToken(token.refresh_token);
console.log("Готово: GOOGLE_REFRESH_TOKEN записан в .env (значение не выводится).");

async function readEnv() {
  const text = await readFile(ENV_FILE, "utf8").catch(() => "");
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

function waitForCode() {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      if (url.pathname !== "/oauth2callback") {
        res.writeHead(404).end();
        return;
      }
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      if (!code && !error) {
        // Например, случайное открытие адреса вручную: продолжаем ждать ответ от Google.
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" }).end("<h3>Ждём ответ от Google. Откройте ссылку из терминала.</h3>");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(code ? "<h3>Готово. Можно закрыть вкладку.</h3>" : "<h3>Ошибка авторизации.</h3>");
      server.close();
      if (code) resolve(code);
      else reject(new Error(`Авторизация отклонена: ${error}`));
    });
    server.listen(PORT, () => {
      console.log("Откройте в браузере и войдите под аккаунтом, где лежит папка с документами:\n");
      console.log(authUrl + "\n");
      console.log(`Ожидаю ответ на ${REDIRECT_URI} ...`);
    });
  });
}

async function exchangeCode(code) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Обмен кода на токен не удался: ${data.error_description ?? data.error}`);
  return data;
}

async function saveRefreshToken(refreshToken) {
  const text = await readFile(ENV_FILE, "utf8");
  const line = `GOOGLE_REFRESH_TOKEN=${refreshToken}`;
  const updated = /^GOOGLE_REFRESH_TOKEN=.*$/m.test(text)
    ? text.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, line)
    : text + (text.endsWith("\n") ? "" : "\n") + line + "\n";
  await writeFile(ENV_FILE, updated, "utf8");
}
