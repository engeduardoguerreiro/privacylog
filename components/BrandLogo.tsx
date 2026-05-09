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
  markSize = 34,
  textClassName = "",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="PrivacyLog"
      className={`inline-flex items-center gap-3 text-white no-underline ${className}`}
    >
      <span
        className="relative shrink-0 overflow-hidden rounded-md border border-[#f6c453]/30 bg-black shadow-[0_0_22px_rgba(139,92,246,0.24)]"
        style={{ height: markSize, width: markSize }}
      >
        <Image
          src="/logo-mark.png"
          alt=""
          fill
          sizes={`${markSize}px`}
          className="object-cover"
          priority
        />
      </span>
      <span className={`font-black tracking-tight ${textClassName}`}>
        Privacy<span className="brand-log-accent">Log</span>
      </span>
    </Link>
  );
}
