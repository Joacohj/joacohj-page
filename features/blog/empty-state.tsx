import { ImageIcon } from "@radix-ui/react-icons"
import { ArrowUpRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"

export function EmptyDemo() {
    return (
        <Empty className="border-dashed border border-input w-full">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>Import Image or Drag & Drop One</EmptyTitle>
                <EmptyDescription>
                    You haven&apos;t uploaded any images yet. Get started by uploading
                    the banner image.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
                <Button>Import Image</Button>
            </EmptyContent>
        </Empty>
    )
}
