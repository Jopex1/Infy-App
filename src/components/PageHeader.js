import Image from "next/image";
import Link from "next/link";

export default function PageHeader({ title, subtitle, backHref = "/" }) {
  return (
    <div className="bg-[#027027] pt-8 pb-5 px-6 rounded-b-[2.5rem] relative sticky top-0 z-50 shadow-md shrink-0">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none" style={{mixBlendMode: 'overlay'}}>
        <Image src="/icons/infy_wordmark_mono_1.png" alt="watermark" width={200} height={200} className="object-contain" />
      </div>

      {/* Logo + Title side by side, centered */}
      <Link href={backHref} className="flex items-center justify-center gap-3 relative z-10">
        <div className="relative w-24 h-8 shrink-0">
          <Image
            src="/icons/infy_wordmark_mono_1.png"
            alt="Infy"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
        <div className="h-8 w-px bg-white/30" />
        <div>
          <h1 className="text-white text-lg font-bold leading-tight">{title}</h1>
          {subtitle && <p className="text-white/70 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </Link>
    </div>
  );
}

