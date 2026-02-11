import type { FeaturesProps } from "@shared/schema";

type Props = { data?: FeaturesProps | Record<string, unknown> };

export function SectionFeatures({ data }: Props) {
  const p = (data || {}) as FeaturesProps;
  const items = p.items ?? [];

  if (items.length === 0) return null;

  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={i} className="text-center p-3 rounded-lg bg-muted/50">
            {item.icon && (
              <div className="text-2xl mb-2">{item.icon}</div>
            )}
            <h4 className="font-medium text-sm text-secondary">{item.title ?? "Feature"}</h4>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
