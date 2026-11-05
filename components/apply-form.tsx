"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { courses } from "@/lib/courses";
import { btnPrimary } from "@/lib/ui";

type Errors = Partial<Record<"name" | "phone" | "course" | "form", string>>;

const field =
  "h-11 w-full rounded-control border border-line bg-bg px-3.5 text-[15px] text-fg placeholder:text-muted focus:border-accent focus:outline-none aria-[invalid=true]:border-accent";

function validate(data: Record<string, string>): Errors {
  const errors: Errors = {};
  if (data.name.trim().length < 2) errors.name = "Укажите имя";
  if (!/^\+?[\d\s()-]{9,20}$/.test(data.phone.trim())) errors.phone = "Укажите телефон в формате +998 90 123 45 67";
  if (!data.course) errors.course = "Выберите направление";
  return errors;
}

export function ApplyForm({ defaultCourse = "" }: { defaultCourse?: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 422) {
        setErrors((await res.json()).errors ?? {});
        setStatus("idle");
        return;
      }
      if (!res.ok) throw new Error("bad response");
      setStatus("sent");
    } catch {
      setErrors({ form: "Не получилось отправить заявку. Попробуйте ещё раз." });
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start gap-3 py-6" role="status">
        <CheckCircleIcon size={36} weight="duotone" className="text-accent" />
        <p className="text-xl font-semibold tracking-tight">Заявка принята</p>
        <p className="max-w-[48ch] leading-relaxed text-muted">
          Мы получили ваши контакты и скоро позвоним.
        </p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="grid gap-2">
        <label htmlFor="lead-name" className="text-sm font-medium">
          Имя
        </label>
        <input id="lead-name" name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby="lead-name-error" />
        {errors.name && (
          <p id="lead-name-error" className="text-sm text-accent">
            {errors.name}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="lead-phone" className="text-sm font-medium">
          Телефон
        </label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          className={field}
          aria-invalid={!!errors.phone}
          aria-describedby="lead-phone-error"
        />
        {errors.phone && (
          <p id="lead-phone-error" className="text-sm text-accent">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="grid gap-2 sm:col-span-2">
        <label htmlFor="lead-course" className="text-sm font-medium">
          Направление
        </label>
        <select id="lead-course" name="course" defaultValue={defaultCourse} className={field} aria-invalid={!!errors.course} aria-describedby="lead-course-error">
          <option value="" disabled>
            Выберите направление
          </option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
          <option value="unsure">Пока не знаю, нужна консультация</option>
        </select>
        {errors.course && (
          <p id="lead-course-error" className="text-sm text-accent">
            {errors.course}
          </p>
        )}
      </div>

      <div className="grid gap-2 sm:col-span-2">
        <label htmlFor="lead-comment" className="text-sm font-medium">
          Комментарий
        </label>
        <textarea id="lead-comment" name="comment" rows={3} maxLength={1000} className={`${field} h-auto py-2.5`} aria-describedby="lead-comment-help" />
        <p id="lead-comment-help" className="text-sm text-muted">
          Необязательно. Например, удобное время для звонка.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className={btnPrimary}>
          {status === "sending" ? "Отправляю..." : "Записаться"}
        </button>
        {errors.form && <p className="text-sm text-accent">{errors.form}</p>}
      </div>
    </form>
  );
}
