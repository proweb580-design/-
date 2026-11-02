import type { NextConfig } from "next";

// Сборка идёт через webpack (флаг --webpack в package.json): Turbopack в Next 16
// падает на кириллице в пути к проекту («Новая папка\ахат»).
const nextConfig: NextConfig = {
  // В D:\axat2 лежит свой package-lock.json; корень проекта указываем явно.
  outputFileTracingRoot: process.cwd(),
  // Эмбеддинги считаются в отдельном процессе (lib/rag/embed-worker.mjs) и в бандл не попадают.
  serverExternalPackages: ["unpdf", "mammoth"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
