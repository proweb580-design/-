/** Знак «Ступень»: три ступени. Простая геометрия, цвет из акцента. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 28 28" aria-hidden="true" className="size-7 shrink-0">
        <rect width="28" height="28" rx="8" className="fill-accent" />
        <path d="M7 20h4.5v-4.5H16V11h5" fill="none" strokeWidth="2.4" strokeLinejoin="round" className="stroke-accent-fg" />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight">Ступень</span>
    </span>
  );
}
