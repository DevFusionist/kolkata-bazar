import type { SectionType } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { StoreSection } from "@shared/schema";

type Props = {
  section: StoreSection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (section: StoreSection) => void;
};

const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  products_grid: "Products grid",
  cta: "Call to action",
  text: "Text block",
  banner: "Banner image",
  features: "Features list",
};

export function SectionPropsEditor({ section, open, onOpenChange, onSave }: Props) {
  const props = section.props ?? {};
  const setProp = (key: string, value: unknown) =>
    onSave({ ...section, props: { ...props, [key]: value } });

  const title = SECTION_LABELS[section.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {section.type === "hero" && (
            <>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={(props.title as string) ?? ""}
                  onChange={(e) => setProp("title", e.target.value)}
                  placeholder="Welcome to our store"
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={(props.subtitle as string) ?? ""}
                  onChange={(e) => setProp("subtitle", e.target.value)}
                  placeholder="Your trusted local store"
                />
              </div>
              <div className="space-y-2">
                <Label>Button text</Label>
                <Input
                  value={(props.ctaText as string) ?? ""}
                  onChange={(e) => setProp("ctaText", e.target.value)}
                  placeholder="Shop Now"
                />
              </div>
              <div className="space-y-2">
                <Label>Hero image URL (optional)</Label>
                <Input
                  value={(props.image as string) ?? ""}
                  onChange={(e) => setProp("image", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </>
          )}
          {section.type === "products_grid" && (
            <>
              <div className="space-y-2">
                <Label>Columns</Label>
                <Select
                  value={String(props.columns ?? 2)}
                  onValueChange={(v) => setProp("columns", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 columns</SelectItem>
                    <SelectItem value="3">3 columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPrices"
                  checked={props.showPrices !== false}
                  onChange={(e) => setProp("showPrices", e.target.checked)}
                />
                <Label htmlFor="showPrices">Show prices on cards</Label>
              </div>
            </>
          )}
          {section.type === "cta" && (
            <>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={(props.title as string) ?? ""}
                  onChange={(e) => setProp("title", e.target.value)}
                  placeholder="Have questions?"
                />
              </div>
              <div className="space-y-2">
                <Label>Button text</Label>
                <Input
                  value={(props.buttonText as string) ?? ""}
                  onChange={(e) => setProp("buttonText", e.target.value)}
                  placeholder="Chat on WhatsApp"
                />
              </div>
            </>
          )}
          {section.type === "text" && (
            <>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={(props.content as string) ?? ""}
                  onChange={(e) => setProp("content", e.target.value)}
                  placeholder="Your text here..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select
                  value={(props.align as string) ?? "center"}
                  onValueChange={(v) => setProp("align", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {section.type === "banner" && (
            <>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={(props.image as string) ?? ""}
                  onChange={(e) => setProp("image", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Link (optional)</Label>
                <Input
                  value={(props.link as string) ?? ""}
                  onChange={(e) => setProp("link", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </>
          )}
          {section.type === "features" && (
            <p className="text-sm text-muted-foreground">
              Feature items can be edited in a future update. For now this section uses default layout.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
