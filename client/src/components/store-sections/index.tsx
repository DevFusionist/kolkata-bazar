import type { Product, StoreSectionApi } from "@/lib/api";
import { SectionHero } from "./SectionHero";
import { SectionProductsGrid } from "./SectionProductsGrid";
import { SectionCta } from "./SectionCta";
import { SectionText } from "./SectionText";
import { SectionBanner } from "./SectionBanner";
import { SectionFeatures } from "./SectionFeatures";

export type StoreSectionData = StoreSectionApi;

type RenderSectionProps = {
  section: StoreSectionApi;
  storeName: string;
  whatsapp: string;
  products: Product[];
};

export function RenderSection({ section, storeName, whatsapp, products }: RenderSectionProps) {
  const { type, props = {} } = section;

  switch (type) {
    case "hero":
      return <SectionHero storeName={storeName} whatsapp={whatsapp} data={props} />;
    case "products_grid":
      return (
        <SectionProductsGrid
          products={products}
          storeName={storeName}
          whatsapp={whatsapp}
          data={props}
        />
      );
    case "cta":
      return <SectionCta whatsapp={whatsapp} data={props} />;
    case "text":
      return <SectionText data={props} />;
    case "banner":
      return <SectionBanner data={props} />;
    case "features":
      return <SectionFeatures data={props} />;
    default:
      return null;
  }
}

export { SectionHero, SectionProductsGrid, SectionCta, SectionText, SectionBanner, SectionFeatures };
