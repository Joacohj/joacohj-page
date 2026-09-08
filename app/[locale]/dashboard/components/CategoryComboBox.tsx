"use client"
import { Button } from "@/components/ui/button"
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox"
import { ChevronDown } from "lucide-react"
import React from "react"
const frameworks = [
    "Next.js",
    "SvelteKit",
    "Nuxt.js",
    "Remix",
    "Astro",
] as const
export function ComboBoxCategory() {
    const anchor = useComboboxAnchor()
    return (
        <>
            <Combobox id="category" multiple items={frameworks} defaultValue={['Next.js']}>
 
                <ComboboxTrigger render={<Button variant="outline" className="w-fit justify-between font-normal"><ComboboxValue /> <ChevronDown/></Button>} />
                <ComboboxContent>
                    <ComboboxInput value={frameworks[0]} showTrigger={false} placeholder="Search" />
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                        {(item) => (
                            <ComboboxItem key={item} value={item}>
                                {item}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
                <ComboboxChips ref={anchor} className="w-full max-w-xs">
                    <ComboboxValue>
                        {(values) => (
                            <React.Fragment>
                                {values.map((value: string) => (
                                    <ComboboxChip key={value}>{value}</ComboboxChip>
                                ))}
                                <ComboboxChipsInput />
                            </React.Fragment>
                        )}
                    </ComboboxValue>
                </ComboboxChips>
            </Combobox>
        </>
    )
}