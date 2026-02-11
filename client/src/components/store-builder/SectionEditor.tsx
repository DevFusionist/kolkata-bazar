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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 flex items-center gap-2 ${isDragging ? "opacity-80 shadow-lg" : ""}`}
    >
      <button
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <span className="flex-1 font-medium text-sm">{SECTION_LABELS[section.type] ?? section.type}</span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
        <Pencil className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onRemove}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </Card>
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add section
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {SECTION_TYPES.map((type) => (
            <DropdownMenuItem key={type} onClick={() => addSection(type)}>
              {SECTION_LABELS[type] ?? type}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={onNext} className={onBack ? "flex-1" : "w-full"} disabled={nextDisabled}>
          {nextLabel}
        </Button>
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
