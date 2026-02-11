import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageConfig, StoreSection } from "@shared/schema";
import { SECTION_TYPES } from "@shared/schema";
import { IonButton, IonCard, IonCardContent, IonActionSheet } from "@ionic/react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { SectionPropsEditor } from "./SectionPropsEditor";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  products_grid: "Products grid",
  cta: "Call to action",
  text: "Text block",
  banner: "Banner image",
  features: "Features",
};

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function SortableSectionRow({
  section,
  onEdit,
  onRemove,
}: {
  section: StoreSection;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <IonCard
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden border-l-4 border-l-primary/30 ${isDragging ? "opacity-90 shadow-xl scale-[1.02]" : ""}`}
    >
      <IonCardContent className="p-0">
        <div className="flex items-center gap-4 px-4 py-3.5">
          <button
            type="button"
            className="touch-none cursor-grab active:cursor-grabbing rounded p-1.5 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <span className="flex-1 font-semibold text-base text-foreground min-w-0 truncate">
            {SECTION_LABELS[section.type] ?? section.type}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30 transition-colors"
              aria-label="Edit section"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 active:bg-destructive/30 transition-colors"
              aria-label="Remove section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
}

type Props = {
  pageConfig: PageConfig;
  onChange: (config: PageConfig) => void;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
};

export function SectionEditor({ pageConfig, onChange, onBack, onNext, nextLabel = "Continue", nextDisabled = false }: Props) {
  const [editingSection, setEditingSection] = useState<StoreSection | null>(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const sections = pageConfig.sections ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newSections = arrayMove(sections, oldIndex, newIndex);
    onChange({ sections: newSections });
  };

  const addSection = (type: (typeof SECTION_TYPES)[number]) => {
    setAddSheetOpen(false);
    const newSection: StoreSection = {
      id: genId(),
      type,
      props: {},
    };
    onChange({ sections: [...sections, newSection] });
  };

  const updateSection = (updated: StoreSection) => {
    const next = sections.map((s) => (s.id === updated.id ? updated : s));
    onChange({ sections: next });
    setEditingSection(null);
  };

  const removeSection = (id: string) => {
    onChange({ sections: sections.filter((s) => s.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-1">Arrange your store</h3>
        <p className="text-sm text-muted-foreground">
          Drag to reorder, or add more sections. Tap a section to edit its content.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableSectionRow
                key={section.id}
                section={section}
                onEdit={() => setEditingSection(section)}
                onRemove={() => removeSection(section.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <IonButton fill="outline" expand="block" onClick={() => setAddSheetOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> Add section
      </IonButton>

      <IonActionSheet
        isOpen={addSheetOpen}
        onDidDismiss={() => setAddSheetOpen(false)}
        header="Add section"
        buttons={[
          ...SECTION_TYPES.map((type) => ({
            text: SECTION_LABELS[type] ?? type,
            handler: () => addSection(type),
          })),
          { text: "Cancel", role: "cancel" },
        ]}
      />

      <div className="flex gap-3 pt-4">
        {onBack && (
          <IonButton fill="outline" onClick={onBack} className="flex-1">
            Back
          </IonButton>
        )}
        <IonButton onClick={onNext} className={onBack ? "flex-1" : "w-full"} disabled={nextDisabled}>
          {nextLabel}
        </IonButton>
      </div>

      {editingSection && (
        <SectionPropsEditor
          section={editingSection}
          open={!!editingSection}
          onOpenChange={(open) => !open && setEditingSection(null)}
          onSave={updateSection}
        />
      )}
    </div>
  );
}
