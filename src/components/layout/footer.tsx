import { Dices } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-14 border-t border-border py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <a
          href="/"
          className="flex items-center gap-2 font-display text-[15px] font-bold tracking-tight text-ink no-underline"
        >
          <Dices className="h-4 w-4 text-accent" aria-hidden="true" />
          Ledger
        </a>
      </div>
      <p className="mt-4 max-w-[64ch] font-sans text-[13px] leading-relaxed text-ink-muted-2">
        Portfolio demo — sample data, no backend. This is a UI case study, not a live
        product.
      </p>
    </footer>
  );
}
