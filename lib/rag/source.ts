/**
 * Источник документов для базы знаний. Сейчас есть только локальная папка;
 * Google Drive подключится как ещё одна реализация этого интерфейса,
 * индексер при этом не меняется.
 */
export interface SourceEntry {
  /** Стабильный идентификатор внутри источника (для папки: относительный путь). */
  id: string;
  /** Имя, которое видит пользователь в ссылках на источник. */
  name: string;
  /** Хэш содержимого: по нему индексер понимает, что файл изменился. */
  hash: string;
}

export interface DocumentSource {
  readonly kind: "local" | "google-drive";
  list(): Promise<SourceEntry[]>;
  readText(entry: SourceEntry): Promise<string>;
}
