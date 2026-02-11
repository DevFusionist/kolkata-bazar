import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Sparkles } from "lucide-react";
import { STORE_TEMPLATES } from "@shared/templates";
import type { PageConfig } from "@shared/schema";

type Props = {
  onSelectTemplate: (templateId: string, pageConfig: PageConfig) => void;
  onBuildFromScratch: (pageConfig: PageConfig) => void;
};

const BLANK_CONFIG: PageConfig = {
  sections: [
    { id: "hero-1", type: "hero", props: { title: "Welcome", subtitle: "Your store", ctaText: "Shop Now" } },
    { id: "products-1", type: "products_grid", props: { columns: 2, showPrices: true } },
    { id: "cta-1", type: "cta", props: { title: "Have questions?", buttonText: "Chat with us" } },
  ],
};

export function TemplatePicker({ onSelectTemplate, onBuildFromScratch }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-1">Design your store</h3>
        <p className="text-sm text-muted-foreground">
          Choose a template and customize it, or build from scratch with drag & drop.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STORE_TEMPLATES.map((t) => (
          <Card
            key={t.id}
            className="p-4 flex flex-col border-2 hover:border-primary/50 transition-colors cursor-pointer group"
            onClick={() => onSelectTemplate(t.id, t.pageConfig)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <LayoutTemplate className="w-5 h-5" />
              </div>
              <span className="font-semibold">{t.name}</span>
            </div>
            <p className="text-sm text-muted-foreground flex-1">{t.description}</p>
            <Button variant="secondary" size="sm" className="mt-3 w-full group-hover:bg-primary group-hover:text-primary-foreground">
              Use & customize
            </Button>
          </Card>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Card
          className="p-4 flex flex-col items-center text-center border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
          onClick={() => onBuildFromScratch(BLANK_CONFIG)}
        >
          <div className="p-3 rounded-full bg-muted text-muted-foreground mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <span className="font-semibold">Build from scratch</span>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop sections to create your perfect store layout.
          </p>
          <Button variant="outline" size="sm" className="mt-3">
            Start building
          </Button>
        </Card>
      </div>
    </div>
  );
}
