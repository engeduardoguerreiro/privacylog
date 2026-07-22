import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  href?: string;
  markSize?: number;
  textClassName?: string;
};

export default function BrandLogo({
  className = "",
  href = "/",
  markSize = 40,
  textClassName = "",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="PrivacyLog"
      className={`brand-logo inline-flex items-center gap-3 no-underline ${className}`}
    >
      <span
        className="relative shrink-0"
        style={{ height: markSize, width: markSize }}
      >
        <Image
          src="/brand/privacylog-mark.png"
          alt=""
          fill
          sizes={`${markSize}px`}
          className="object-contain"
          priority
        />
      </span>
      <span className={`brand-logo-text ${textClassName}`}>
        Privacy<span className="brand-log-accent">Log</span>
      </span>
    </Link>
  );
}
