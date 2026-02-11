import type { SectionType } from "@shared/schema";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonCheckbox,
} from "@ionic/react";
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
    <IonModal isOpen={open} onDidDismiss={() => onOpenChange(false)}>
      <IonHeader>
        <IonToolbar className="ion-padding-start ion-padding-end">
          <IonTitle>Edit {title}</IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => onOpenChange(false)}>
            Done
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="space-y-4 py-4 px-4">
          {section.type === "hero" && (
            <>
              <IonItem lines="none">
                <IonLabel position="stacked">Title</IonLabel>
                <IonInput
                  value={(props.title as string) ?? ""}
                  onIonInput={(e) => setProp("title", e.detail.value ?? "")}
                  placeholder="Welcome to our store"
                />
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="stacked">Subtitle</IonLabel>
                <IonInput
                  value={(props.subtitle as string) ?? ""}
                  onIonInput={(e) => setProp("subtitle", e.detail.value ?? "")}
                  placeholder="Your trusted local store"
                />
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="stacked">Button text</IonLabel>
                <IonInput
                  value={(props.ctaText as string) ?? ""}
                  onIonInput={(e) => setProp("ctaText", e.detail.value ?? "")}
                  placeholder="Shop Now"
                />
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="stacked">Hero image URL (optional)</IonLabel>
                <IonInput
                  value={(props.image as string) ?? ""}
                  onIonInput={(e) => setProp("image", e.detail.value ?? "")}
                  placeholder="https://..."
                />
              </IonItem>
            </>
          )}
          {section.type === "products_grid" && (
            <>
              <IonItem lines="none">
                <IonLabel position="stacked">Columns</IonLabel>
                <IonSelect
                  value={String(props.columns ?? 2)}
                  onIonChange={(e) => setProp("columns", Number(e.detail.value))}
                  placeholder="Select"
                >
                  <IonSelectOption value="2">2 columns</IonSelectOption>
                  <IonSelectOption value="3">3 columns</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem lines="none">
                <IonCheckbox
                  checked={props.showPrices !== false}
                  onIonChange={(e) => setProp("showPrices", e.detail.checked)}
                />
                <IonLabel>Show prices on cards</IonLabel>
              </IonItem>
            </>
          )}
          {section.type === "cta" && (
            <>
              <IonItem lines="none">
                <IonLabel position="stacked">Title</IonLabel>
                <IonInput
                  value={(props.title as string) ?? ""}
                  onIonInput={(e) => setProp("title", e.detail.value ?? "")}
                  placeholder="Have questions?"
                />
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="stacked">Button text</IonLabel>
                <IonInput
                  value={(props.buttonText as string) ?? ""}
                  onIonInput={(e) => setProp("buttonText", e.detail.value ?? "")}
                  placeholder="Chat on WhatsApp"
                />
              </IonItem>
            </>
          )}
          {section.type === "text" && (
            <>
              <IonItem lines="none">
                <IonLabel position="stacked">Content</IonLabel>
                <IonTextarea
                  value={(props.content as string) ?? ""}
                  onIonInput={(e) => setProp("content", e.detail.value ?? "")}
                  placeholder="Your text here..."
                  rows={3}
                />
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="stacked">Alignment</IonLabel>
                <IonSelect
                  value={(props.align as string) ?? "center"}
                  onIonChange={(e) => setProp("align", e.detail.value)}
                  placeholder="Select"
                >
                  <IonSelectOption value="left">Left</IonSelectOption>
                  <IonSelectOption value="center">Center</IonSelectOption>
                  <IonSelectOption value="right">Right</IonSelectOption>
                </IonSelect>
              </IonItem>
            </>
          )}
          {section.type === "banner" && (
            <>
              <IonItem lines="none">
                <IonLabel position="stacked">Image URL</IonLabel>
                <IonInput
                  value={(props.image as string) ?? ""}
                  onIonInput={(e) => setProp("image", e.detail.value ?? "")}
                  placeholder="https://..."
                />
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="stacked">Link (optional)</IonLabel>
                <IonInput
                  value={(props.link as string) ?? ""}
                  onIonInput={(e) => setProp("link", e.detail.value ?? "")}
                  placeholder="https://..."
                />
              </IonItem>
            </>
          )}
          {section.type === "features" && (
            <p className="text-sm text-muted-foreground ion-padding">
              Feature items can be edited in a future update. For now this section uses default layout.
            </p>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
}
