import { Link } from "react-router-dom";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const actionBtn =
  "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-semibold shadow-none";

export function AdminEditButton({ href, onClick, label = "Edit", className, ...props }) {
  const classes = cn(
    actionBtn,
    "border-border/80 bg-background text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
    className
  );

  if (href) {
    return (
      <Button asChild variant="outline" size="sm" className={classes} {...props}>
        <Link to={href}>
          <Pencil className="size-3.5" />
          <span>{label}</span>
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={classes}
      onClick={onClick}
      {...props}
    >
      <Pencil className="size-3.5" />
      <span>{label}</span>
    </Button>
  );
}

export function AdminDeleteButton({ onClick, label = "Delete", className, ...props }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        actionBtn,
        "border-destructive/25 bg-background text-destructive hover:border-destructive/50 hover:bg-destructive/8 hover:text-destructive",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <Trash2 className="size-3.5" />
      <span>{label}</span>
    </Button>
  );
}

export function AdminConfirmButton({ onClick, label = "Confirm", className, ...props }) {
  return (
    <Button
      type="button"
      size="sm"
      className={cn(actionBtn, "rounded-lg shadow-sm shadow-primary/20", className)}
      onClick={onClick}
      {...props}
    >
      <Check className="size-3.5" />
      <span>{label}</span>
    </Button>
  );
}

export function AdminCancelButton({ onClick, label = "Cancel", className, ...props }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        actionBtn,
        "border-destructive/25 bg-background text-destructive hover:border-destructive/50 hover:bg-destructive/8",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <X className="size-3.5" />
      <span>{label}</span>
    </Button>
  );
}

export function AdminRowActions({ children, className }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {children}
    </div>
  );
}
