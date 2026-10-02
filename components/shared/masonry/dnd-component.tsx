"use client";

import type { ReactNode, CSSProperties } from "react";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type SortableMediaProps = {
  id: string;
  children: ReactNode;
};

export function SortableMedia({
  id,
  children,
}: SortableMediaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

type SortableMediaContainerProps = {
  media: {
    id: string;
    order: number;
  }[];

  children: (mediaId: string) => ReactNode;

  onReorder: (
    media: typeof media,
  ) => void;
};

export function SortableMediaContainer({
  media,
  children,
  onReorder,
}: SortableMediaContainerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const sortedMedia = [...media].sort(
    (a, b) => a.order - b.order,
  );

  const ids = sortedMedia.map(
    (media) => media.id,
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedMedia.findIndex(
      (media) => media.id === active.id,
    );

    const newIndex = sortedMedia.findIndex(
      (media) => media.id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(
      sortedMedia,
      oldIndex,
      newIndex,
    );

    const updated = reordered.map(
      (media, index) => ({
        ...media,
        order: index,
      }),
    );

    onReorder(updated);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ids}
        strategy={rectSortingStrategy}
      >
        {sortedMedia.map((media) => (
          <SortableMedia
            key={media.id}
            id={media.id}
          >
            {children(media.id)}
          </SortableMedia>
        ))}
      </SortableContext>
    </DndContext>
  );
}