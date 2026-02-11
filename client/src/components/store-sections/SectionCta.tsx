import type { CtaProps } from "@shared/schema";

type Props = { whatsapp: string; data?: CtaProps | Record<string, unknown> };

export function SectionCta({ whatsapp, data }: Props) {
  const p = (data || {}) as CtaProps;
  const title = p.title ?? "Have questions? Chat with us!";
  const buttonText = p.buttonText ?? "Chat on WhatsApp";

  const openWhatsApp = () => {
    const num = whatsapp.replace(/\D/g, "").replace(/^0/, "");
    const wa = num.startsWith("91") ? num : `91${num}`;
    window.open(`https://wa.me/${wa}`, "_blank");
  };

  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <div className="rounded-2xl bg-secondary/10 border border-secondary/20 p-6 text-center">
        <h3 className="font-semibold text-lg text-secondary">{title}</h3>
        <button
          type="button"
          onClick={openWhatsApp}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 font-semibold shadow-md transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
}
