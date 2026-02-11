import type { TextProps } from "@shared/schema";

type Props = { data?: TextProps | Record<string, unknown> };

export function SectionText({ data }: Props) {
  const p = (data || {}) as TextProps;
  const content = p.content ?? "";
  const align = p.align ?? "center";

  if (!content) return null;

  const alignClass = align === "right" ? "text-right" : align === "left" ? "text-left" : "text-center";

  return (
    <section className="max-w-md mx-auto px-4 py-4">
      <div className={`text-muted-foreground text-sm ${alignClass}`}>{content}</div>
    </section>
  );
}
