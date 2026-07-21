import Image from "next/image";
import Link from "next/link";

export default function PageHeader({ title, subtitle, backHref = "/" }) {
  return (
    <div className="bg-[#027027] pt-10 pb-7 px-6 rounded-b-[2.5rem]">
      <Link href={backHref} className="inline-block mb-3">
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
      <h1 className="text-white text-2xl font-bold leading-tight">{title}</h1>
      {subtitle && <p className="text-white/70 text-sm mt-0.5">{subtitle}</p>}
    </div>
  );
}
