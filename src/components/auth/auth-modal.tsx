import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useExitAnimation } from "@/hooks/use-exit-animation";

export function AuthModal() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mounted, closing } = useExitAnimation(auth.isModalOpen);

  useEffect(() => {
    if (!auth.isModalOpen) {
      setEmail("");
      setPassword("");
      setError(null);
    }
  }, [auth.isModalOpen]);

  useEffect(() => {
    if (!auth.isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") auth.closeLoginModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [auth]);

  if (!mounted) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are both required.");
      return;
    }
    auth.login(email.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={auth.closeLoginModal}
    >
      {/* Scrim and surface are timed separately: the scrim is linear and
          unremarkable so the surface can carry the doctrine. */}
      <div className="m-scrim absolute inset-0 bg-black/70" data-closing={closing} aria-hidden="true" />
      <div
        className="m-overlay relative w-full max-w-[420px] border border-border-2 bg-panel"
        data-closing={closing}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="font-mono text-[11.5px] text-ink">auth.login</span>
          <button
            type="button"
            title="Close"
            onClick={auth.closeLoginModal}
            className="text-ink-muted-2 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div>
            <h2 id="auth-modal-title" className="font-display text-[20px] font-bold text-ink">
              signup / login
            </h2>
            <p className="mt-1.5 font-sans text-[13.5px] leading-[1.55] text-ink-muted">
              Sign in to keep your credit balance, characters, and generation history together.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-muted-2">email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-border-2 bg-panel-2 px-2.5 py-2 font-sans text-[14px] text-ink placeholder:text-ink-muted-2 focus:border-accent focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-muted-2">password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-border-2 bg-panel-2 px-2.5 py-2 font-sans text-[14px] text-ink placeholder:text-ink-muted-2 focus:border-accent focus:outline-none"
            />
          </label>

          {error && <p className="font-mono text-[11.5px] text-red">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            <span />
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={auth.closeLoginModal}>
                cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                continue →
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
