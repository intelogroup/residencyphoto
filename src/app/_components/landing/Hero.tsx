import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-14 pb-20 md:pt-24 md:pb-24 grid md:grid-cols-5 gap-12 items-start relative">
      {/* Left Column: Text & CTAs */}
      <div className="md:col-span-3 space-y-6">
        <h1 className="font-sans text-4xl md:text-5xl font-bold tracking-tight text-heading leading-tight max-w-2xl text-balance">
          Fix and format your ERAS headshot, <br />
          <span className="text-primary">under a minute.</span>
        </h1>

        <p className="font-sans text-base text-body max-w-md leading-relaxed">
          ERAS asks for a very specific photo size and file type. Upload yours, drag it into place,
          and we&apos;ll resize it to fit — no design skills needed, and your photo never leaves your browser.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link href="/login" className="btn-primary">
            Upload your photo
          </Link>
          <a href="#how-it-works" className="btn-ghost">
            See how it works
          </a>
        </div>

      </div>

      {/* Right Column: ERAS crop preview */}
      <div className="md:col-span-2 flex justify-center md:justify-end">
        <div className="relative w-full max-w-xs aspect-[4/5] overflow-hidden rounded-xl">
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[46%] aspect-square rounded-full border-2 border-dashed border-primary/60" />
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[66%] h-[44%] rounded-t-3xl border-2 border-dashed border-primary/50 border-b-0" />
          </div>

          <Image
            src="/professional_headshot.jpg"
            alt="Professional Medical Residency Headshot"
            width={375}
            height={525}
            priority
            className="absolute h-full w-full object-cover object-center select-none"
          />
        </div>
      </div>
    </section>
  );
}
