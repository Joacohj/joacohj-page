"use client";

import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
    ItemActions,
} from "@/components/ui/item";

import { Button } from "@/components/ui/button";

import {
    ArrowDownToLine,
    ArrowUpToLine,
    ImageIcon,
    TrashIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatFileSize } from "@/utils/helpers";
import { getFileId } from "./FileForm";
import React from "react";
import { DragHandleDots1Icon } from "@radix-ui/react-icons";

type SortableFileProps = {
    file: File;
    files: File[];
    setFiles: (files: File[]) => void;
    onRemove: (file: File) => void;
    onSelect: (file: File) => void
};

export function SortableFile({
    file,
    files,
    setFiles,
    onRemove,
    onSelect
}: SortableFileProps) {
    const {
        attributes,
        listeners,

        isDragging,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: getFileId(file),
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const currentIndex = files.findIndex(
        (currentFile) =>
            getFileId(currentFile) === getFileId(file)
    );

    const handleMoveUp = () => {
        if (currentIndex <= 0) return;

        setFiles(
            arrayMove(
                files,
                currentIndex,
                currentIndex - 1
            )
        );
    };

    const handleMoveDown = () => {
        if (
            currentIndex === -1 ||
            currentIndex >= files.length - 1
        ) {
            return;
        }

        setFiles(
            arrayMove(
                files,
                currentIndex,
                currentIndex + 1
            )
        );
    };

    return (
        <div
            ref={setNodeRef}
            style={style}

        >
            <Item
                variant="outline"
                onClick={() => onSelect(file)}
                className={cn(
                    "relative blurScroll cursor-pointer",
                    isDragging &&
                    "scale-[1.02] opacity-50 shadow-lg"
                )}
            >
                <ItemMedia variant="icon">
                    <Button className={cn("cursor-grab", isDragging ? 'cursor-grabbing' : '')} variant={'ghost'} size={'icon-lg'}            {...attributes}
                        {...listeners}><DragHandleDots1Icon /></Button>
                </ItemMedia>

                <ItemContent className="flex">
                    <div>
                        <ItemTitle>
                            {file.name}
                        </ItemTitle>

                        <ItemDescription>
                            Size: {formatFileSize(file.size)}
                        </ItemDescription>
                    </div>
                </ItemContent>

                <ItemActions>
                    <Button
                        type="button"
                        variant="destructive"
                        onPointerDown={(e) =>
                            e.stopPropagation()
                        }
                        onClick={() => onRemove(file)}
                    >
                        <TrashIcon />
                        Delete
                    </Button>

                    <div className="flex flex-col">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={currentIndex <= 0}
                            onPointerDown={(e) =>
                                e.stopPropagation()
                            }
                            onClick={handleMoveUp}
                        >
                            <ArrowUpToLine />
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={
                                currentIndex === -1 ||
                                currentIndex >=
                                files.length - 1
                            }
                            onPointerDown={(e) =>
                                e.stopPropagation()
                            }
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