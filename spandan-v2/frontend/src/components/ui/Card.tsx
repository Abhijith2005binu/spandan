import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-surface-1 border border-border rounded-lg p-6 transition-colors hover:border-accent/40 ${className}`}
    >
      {children}
    </div>
  );
}
