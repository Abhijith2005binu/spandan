import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent/90",
  secondary: "bg-surface-2 text-text-primary hover:bg-surface-2/70 border border-border",
  danger: "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-transform duration-75 active:scale-[0.97] ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
