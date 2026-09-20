"use client";
import React from "react";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
    ItemActions,
} from "@/app/components/ui/item";

import { Button } from "@/app/components/ui/button";

import {
    ArrowDownToLine,
    ArrowUpToLine,
    LinkIcon,
    TrashIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DragHandleDots1Icon } from "@radix-ui/react-icons";

import type { MediaItem } from "@/features/post/FileForm";
import { formatFileSize } from "@/hooks/utils/helpers";

interface SortableMediaProps {
    media: MediaItem;
    medias: MediaItem[];
    setMedias: React.Dispatch<
        React.SetStateAction<MediaItem[]>
    >;
    onRemove: (media: MediaItem) => void;
    onSelect: (media: MediaItem) => void;
}
export function SortableMedia({
    media,
    medias,
    setMedias,
    onRemove,
    onSelect,
}: SortableMediaProps) {
    const {
        attributes,
        listeners,
        isDragging,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: media.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const currentIndex = medias.findIndex(
        (currentMedia) => currentMedia.id === media.id,
    );
    const handleMoveUp = () => {
        if (currentIndex <= 0) return;
        setMedias(arrayMove(medias, currentIndex, currentIndex - 1));
    };
    const handleMoveDown = () => {
        if (currentIndex === -1 || currentIndex >= medias.length - 1) {
            return;
        }
        setMedias(arrayMove(medias, currentIndex, currentIndex + 1));
    };
    const isYoutube = media.type === "youtube";
    return (
        <div ref={setNodeRef} style={style}>

            <Item
                variant="outline"
                onClick={() => onSelect(media)}
                className={cn(
                    "relative blurScroll cursor-pointer",
                    isDragging && "scale-[1.02] opacity-50 shadow-lg",
                )}
            >

                <ItemMedia variant="icon">

                    <Button
                        type="button"
                        className={cn("cursor-grab", isDragging && "cursor-grabbing")}
                        variant="ghost"
                        size="icon-lg"
                        {...attributes}
                        {...listeners}
                    >

                        {isYoutube ? <LinkIcon /> : <DragHandleDots1Icon />}
                    </Button>
                </ItemMedia>
                <ItemContent className="flex">

                    <div>

                        <ItemTitle>

                            {media.type === "youtube"
                                ? "YouTube video"
                                : media.file.current.name}
                        </ItemTitle>
                        <ItemDescription>

                            {media.type === "youtube"
                                ? media.url
                                : `Size: ${formatFileSize(media.file.current.size)}`}
                        </ItemDescription>
                    </div>
                </ItemContent>
                <ItemActions>

                    <Button
                        type="button"
                        variant="destructive"
                        onPointerDown={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={() => onRemove(media)}
                    >

                        <TrashIcon /> Delete
                    </Button>
                    <div className="flex flex-col">

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={currentIndex <= 0}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                            }}
                            onClick={handleMoveUp}
                        >

                            <ArrowUpToLine />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={
                                currentIndex === -1 || currentIndex >= medias.length - 1
                            }
                            onPointerDown={(e) => {
                                e.stopPropagation();
                            }}
                            onClick={handleMoveDown}
                        >

                            <ArrowDownToLine />
                        </Button>
                    </div>
                </ItemActions>
            </Item>
        </div>
    );
}
