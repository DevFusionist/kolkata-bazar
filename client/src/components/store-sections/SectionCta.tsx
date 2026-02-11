import { IonButton } from "@ionic/react";
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
        <IonButton
          fill="solid"
          shape="round"
          className="mt-4 bg-[#25D366] text-white font-semibold"
          onClick={openWhatsApp}
        >
          {buttonText}
        </IonButton>
      </div>
    </section>
  );
}
