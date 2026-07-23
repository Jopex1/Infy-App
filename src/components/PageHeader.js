import Image from "next/image";
import Link from "next/link";

export default function PageHeader({ title, subtitle, backHref = "/" }) {
  return (
    <div className="bg-[#027027] pt-10 pb-7 px-6 rounded-b-[2.5rem] relative sticky top-0 z-50 shadow-md shrink-0">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none" style={{mixBlendMode: 'overlay'}}>
        <Image src="/icons/infy_wordmark_mono_1.png" alt="watermark" width={200} height={200} className="object-contain" />
      </div>
      <Link href={backHref} className="inline-block mb-3 relative z-10">
        <div className="relative w-28 h-9">
          <Image
            src="/icons/infy_wordmark_mono_1.png"
            alt="Infy"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      </Link>
      <h1 className="text-white text-2xl font-bold leading-tight relative z-10">{title}</h1>
      {subtitle && <p className="text-white/70 text-sm mt-0.5 relative z-10">{subtitle}</p>}
    </div>
  );
}

