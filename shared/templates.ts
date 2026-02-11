import type { PageConfig, StoreSection } from "./schema";

export type StoreTemplate = {
  id: string;
  name: string;
  description: string;
  /** Optional preview image URL */
  preview?: string;
  pageConfig: PageConfig;
};

const section = (s: StoreSection): StoreSection => s;

export const STORE_TEMPLATES: StoreTemplate[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple — hero, products, and WhatsApp CTA",
    pageConfig: {
      sections: [
        section({
          id: "h1",
          type: "hero",
          props: {
            title: "Welcome to our store",
            subtitle: "Quality products, easy ordering",
            ctaText: "Shop Now",
          },
        }),
        section({ id: "p1", type: "products_grid", props: { columns: 2, showPrices: true } }),
        section({
          id: "c1",
          type: "cta",
          props: { title: "Questions? Chat with us!", buttonText: "Chat on WhatsApp" },
        }),
      ],
    },
  },
  {
    id: "boutique",
    name: "Boutique",
    description: "Elegant layout for sarees, fashion & lifestyle",
    pageConfig: {
      sections: [
        section({
          id: "h1",
          type: "hero",
          props: {
            title: "Discover our collection",
            subtitle: "Handpicked for you",
            ctaText: "Explore",
          },
        }),
        section({ id: "t1", type: "text", props: { content: "Curated with care in Kolkata.", align: "center" } }),
        section({ id: "p1", type: "products_grid", props: { columns: 2, showPrices: true } }),
        section({
          id: "c1",
          type: "cta",
          props: { title: "Order or enquire on WhatsApp", buttonText: "Chat with us" },
        }),
      ],
    },
  },
  {
    id: "food",
    name: "Food & Menu",
    description: "Great for home chefs, cafés and food businesses",
    pageConfig: {
      sections: [
        section({
          id: "h1",
          type: "hero",
          props: {
            title: "Today's specials",
            subtitle: "Fresh from our kitchen",
            ctaText: "See menu",
          },
        }),
        section({ id: "p1", type: "products_grid", props: { columns: 1, showPrices: true } }),
        section({
          id: "c1",
          type: "cta",
          props: { title: "Place your order", buttonText: "Order on WhatsApp" },
        }),
      ],
    },
  },
  {
    id: "classic",
    name: "Classic Shop",
    description: "Traditional storefront with banner and features",
    pageConfig: {
      sections: [
        section({
          id: "h1",
          type: "hero",
          props: {
            title: "Your shop name",
            subtitle: "Serving Kolkata with pride",
            ctaText: "View products",
          },
        }),
        section({
          id: "f1",
          type: "features",
          props: {
            items: [
              { title: "Quality", description: "Best products" },
              { title: "Fast reply", description: "Quick on WhatsApp" },
              { title: "Local", description: "Based in Kolkata" },
            ],
          },
        }),
        section({ id: "p1", type: "products_grid", props: { columns: 3, showPrices: true } }),
        section({
          id: "c1",
          type: "cta",
          props: { title: "Get in touch", buttonText: "Chat with Seller" },
        }),
      ],
    },
  },
];

export function getTemplateById(id: string): StoreTemplate | undefined {
  return STORE_TEMPLATES.find((t) => t.id === id);
}

export function getDefaultPageConfig(): PageConfig {
  return STORE_TEMPLATES[0].pageConfig;
}
