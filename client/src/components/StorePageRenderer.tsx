import type { PageConfig } from "@/lib/api";
import type { Product } from "@/lib/api";
import { RenderSection, type StoreSectionData } from "@/components/store-sections";

function normalizeWhatsapp(v: string): string {
  const digits = v.replace(/\D/g, "").replace(/^0+/, "");
  return digits.startsWith("91") ? digits : `91${digits}`;
}

type Props = {
  storeName: string;
  whatsapp: string;
  products: Product[];
  pageConfig: PageConfig;
};

export function StorePageRenderer({ storeName, whatsapp, products, pageConfig }: Props) {
  const sections = pageConfig?.sections ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {sections.map((section) => (
        <RenderSection
          key={section.id}
          section={section}
          storeName={storeName}
          whatsapp={whatsapp}
          products={products}
        />
      ))}
      {/* Floating WhatsApp CTA */}
      <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 flex justify-center pointer-events-none">
        <a
          href={`https://wa.me/${normalizeWhatsapp(whatsapp)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full shadow-lg bg-[#25D366] hover:bg-[#128C7E] text-white pointer-events-auto px-6 py-3 font-medium inline-flex items-center justify-center transition-colors"
        >
          Chat with Seller
        </a>
      </div>
    </div>
  );
}
