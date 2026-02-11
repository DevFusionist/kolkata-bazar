import type { HeroProps } from "@shared/schema";

type Props = { storeName: string; whatsapp: string; data?: HeroProps | Record<string, unknown> };

export function SectionHero({ storeName, whatsapp, data }: Props) {
  const p = (data || {}) as HeroProps;
  const title = p.title ?? storeName;
  const subtitle = p.subtitle ?? "Your trusted local store";
  const ctaText = p.ctaText ?? "Shop Now";
  const image = p.image ?? `https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80`;

  const openWhatsApp = () => {
    const num = whatsapp.replace(/\D/g, "").replace(/^0/, "");
    const wa = num.startsWith("91") ? num : `91${num}`;
    window.open(`https://wa.me/${wa}`, "_blank");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary/90 to-secondary text-white">
      <div className="absolute inset-0 opacity-30">
        <img src={image} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="relative max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold font-serif drop-shadow-md">{title}</h1>
        <p className="mt-2 text-white/90 text-lg">{subtitle}</p>
        <button
          type="button"
          onClick={openWhatsApp}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white text-secondary px-6 py-3 font-semibold shadow-lg hover:bg-white/95 transition-colors"
        >
          {ctaText}
        </button>
      </div>
    </section>
  );
}
