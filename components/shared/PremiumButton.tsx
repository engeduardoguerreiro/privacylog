import Link from "next/link";
import type { ReactNode } from "react";

type PremiumButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
};

export default function PremiumButton({
  children,
  href,
  variant = "primary",
  disabled = false,
  className = "",
}: PremiumButtonProps) {
  const classes = `${variant === "primary" ? "primary-button" : "secondary-button"} ${
    disabled ? "pointer-events-none opacity-45" : ""
  } ${className}`;

  if (!href || disabled) {
    return <span className={classes}>{children}</span>;
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
