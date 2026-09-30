import { createContext, useCallback, useContext, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts) => {
      const id = ++toastId;
      const item = {
        id,
        title: opts.title || "",
        description: opts.description || "",
        variant: opts.variant || "error",
      };
      setToasts((list) => [...list, item]);
      const ms = opts.duration ?? 4000;
      if (ms > 0) {
        setTimeout(() => dismiss(id), ms);
      }
      return id;
    },
    [dismiss]
  );

  const value = {
    toast,
    success: (title, description) => toast({ title, description, variant: "success" }),
    error: (title, description) => toast({ title, description, variant: "error" }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 z-100 flex w-[min(100%-2rem,22rem)] flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
              t.variant === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-destructive/30 bg-card text-foreground"
            )}
          >
            <div className="min-w-0 flex-1">
              {t.title && (
                <p
                  className={cn(
                    "text-sm font-semibold",
                    t.variant === "error" && "text-destructive"
                  )}
                >
                  {t.title}
                </p>
              )}
              {t.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              className="rounded-md p-0.5 text-muted-foreground hover:text-foreground"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
