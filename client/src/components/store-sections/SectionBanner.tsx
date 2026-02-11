import type { BannerProps } from "@shared/schema";

type Props = { data?: BannerProps | Record<string, unknown> };

export function SectionBanner({ data }: Props) {
  const p = (data || {}) as BannerProps;
  const image = p.image ?? "";
  const link = p.link ?? "";
  const alt = p.alt ?? "Banner";

  if (!image) return null;

  const content = (
    <div className="rounded-xl overflow-hidden shadow-sm">
      <img src={image} alt={alt} className="w-full h-auto object-cover" />
    </div>
  );

  return (
    <section className="max-w-md mx-auto px-4 py-4">
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </section>
  );
}
