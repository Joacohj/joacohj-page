/* eslint-disable @next/next/no-html-link-for-pages */
'use client'

import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarTrigger
} from "@/components/ui/sidebar"

import {
    Avatar,
    AvatarImage,
    AvatarFallback,
    AvatarBadge
} from "@/components/ui/avatar"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible"

import {
    Popover,
    PopoverTrigger,
    PopoverContent
} from "@/components/ui/popover"

import { ArchiveIcon, CaretSortIcon, CubeIcon, DashboardIcon, EyeClosedIcon, EyeOpenIcon, GearIcon, ImageIcon, Pencil1Icon, Pencil2Icon } from "@radix-ui/react-icons"
import { Separator } from "@base-ui/react"
import { ChartBar, ChevronDown, GalleryThumbnailsIcon, LogOutIcon } from "lucide-react"
import { Link } from "@/src/i18n/navigation"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LanguageSwitcher } from "@/src/components/language-switcher"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
const AIProviders = ['OpenAI', 'Anthropic', 'Groq', 'Google']
const OpenAIModels = ['GPT-6 Astra', 'GPT-5.6 Sol', 'GPT-5.6 Terra', 'GPT-5.6 Luna']
export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="mt-2" render={<Link className="flex items-center" href={"/dashboard/overview"}>
                            <DashboardIcon />
                            Dashboard
                        </Link>} />
                    </SidebarMenuItem>

                </SidebarMenu>
            </SidebarHeader>
            <Separator className="bg-accent h-0.5 w-full my-2" />
            <SidebarContent>
                <Collapsible defaultOpen className="group/collapsible">
                    <SidebarGroup>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                render={
                                    <CollapsibleTrigger className="group flex justify-between">
                                        <div className="flex gap-2">
                                            <ArchiveIcon />
                                            Feed
                                        </div>

                                        <ChevronDown className="transition-transform group-aria-expanded:rotate-180" />
                                    </CollapsibleTrigger>
                                }
                            />
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuButton render={<Link href={"/dashboard/feed/post/create"}><Pencil2Icon />Create Post</Link>} />
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuButton render={<Link href={"/dashboard/feed/gallery/overview"}><ImageIcon />Gallery Overview</Link>} />
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </SidebarGroup>
                </Collapsible>
                <Collapsible defaultOpen className="group/collapsible">
                    <SidebarGroup>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                render={
                                    <CollapsibleTrigger className="group flex justify-between">
                                        <div className="flex gap-2">
                                            <ArchiveIcon />
                                            Blog
                                        </div>

                                        <ChevronDown className="transition-transform group-aria-expanded:rotate-180" />
                                    </CollapsibleTrigger>
                                }
                            />
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuButton render={<Link href={"/dashboard/blog/create"}><Pencil2Icon />Create Post</Link>} />
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuButton render={<Link href={"/dashboard/blog/analytics"}><ChartBar />Blog Analytics</Link>} />
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </SidebarGroup>
                </Collapsible>
                {/* <Separator className="bg-accent h-0.5 w-full my-2" /> */}

                <Collapsible defaultOpen className="group/collapsible">
                    <SidebarGroup>
                        <SidebarMenuItem>
                            <SidebarMenuButton render={<CollapsibleTrigger className="group flex justify-between">
                                <div className="flex gap-2">
                                    <CubeIcon />
                                    Services
                                </div>
                                <ChevronDown className="transition-transform group-aria-expanded:rotate-180" />
                            </CollapsibleTrigger>}>

                            </SidebarMenuButton>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuButton render={<Link href={"blog/create"}><Pencil2Icon />Add Services</Link>} />
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuButton render={<Link href={"blog/analytics"}><ChartBar />Services Usage</Link>} />
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </SidebarGroup>
                </Collapsible>
            </SidebarContent>
            <Separator className="my-0.5 bg-accent h-0.5" />
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem className="py-4">
                        <Popover>
                            <PopoverTrigger
                                render={
                                    <SidebarMenuButton
                                        className="
                                py-7 px-2
                                flex items-center justify-between

                                group-data-[collapsible=icon]:justify-center
                                group-data-[collapsible=icon]:px-0
                            "
                                    >
                                        <div
                                            className="
                                    flex gap-2 items-center

                                    group-data-[collapsible=icon]:justify-center
                                "
                                        >
                                            <Avatar>
                                                <AvatarImage src="..." />
                                                <AvatarFallback>JA</AvatarFallback>
                                            </Avatar>

                                            <div
                                                className="
                                        flex flex-col text-left

                                        group-data-[collapsible=icon]:hidden
                                    "
                                            >
                                                <span>Joaquín</span>

                                                <span className="text-xs text-muted-foreground">
                                                    joaquin@example.com
                                                </span>
                                            </div>
                                        </div>

                                        <CaretSortIcon
                                            className="
                                    group-data-[collapsible=icon]:hidden
                                "
                                        />
                                    </SidebarMenuButton>
                                }
                            />

                            <PopoverContent
                                className="px-0 py-3 w-fit"
                                side="right"
                                align="end"
                            >
                                <div className="flex gap-2 px-3 items-center">
                                    <Avatar>
                                        <AvatarImage src="..." />
                                        <AvatarFallback>JA</AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col text-left">
                                        <span>Joaquín</span>

                                        <span className="text-xs text-muted-foreground">
                                            joaquin@example.com
                                        </span>
                                    </div>
                                </div>


                                <Separator className="my-0.5 bg-accent h-0.5" />

                                <div className="px-2">
                                    <Dialog>
                                        <DialogTrigger render={<Button
                                            variant="ghost"
                                            className="w-full flex justify-start py-2 items-center"
                                        >
                                            <GearIcon />
                                            Configuration
                                        </Button>} />
                                        <DialogContent className="min-w-[450px] pt-8">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Account Configuration
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4 py-4">

                                                <div className="flex gap-2 items-center mb-6">
                                                    <Avatar size="lg">
                                                        <AvatarFallback>JA</AvatarFallback>
                                                        <AvatarBadge><Pencil1Icon width={15} height={15} /></AvatarBadge>
                                                    </Avatar>

                                                    <div className="flex flex-col text-left">
                                                        <span>Joaquín</span>

                                                        <span className="text-xs text-muted-foreground">
                                                            joaquin@example.com
                                                        </span>
                                                    </div>
                                                </div>
                                                <Separator className="h-0.5 w-full bg-accent my-5" />

                                                <form className="flex flex-col gap-5">
                                                    <FieldGroup>
                                                        <Field>
                                                            <FieldLabel htmlFor="full_name">Full name</FieldLabel>
                                                            <FieldContent className="flex justify-start flex-col items-start gap-3">
                                                                <InputGroup className="py-4">
                                                                    <InputGroupInput id="full_name" type="text" placeholder="Jhon Doe" />

                                                                </InputGroup>
                                                            </FieldContent>
                                                        </Field>
                                                    </FieldGroup>
                                                    <Separator className="h-0.5 w-full bg-accent" />
                                                    <FieldGroup>
                                                        <FieldSet>
                                                            <FieldLegend>
                                                                AI key Support
                                                            </FieldLegend>
                                                            <FieldDescription>
                                                                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                                            </FieldDescription>
                                                        </FieldSet>
                                                        <FieldGroup>
                                                            <FieldLabel htmlFor="AI_provider">AI Provider</FieldLabel>
                                                            <Combobox id="AI_provider" items={AIProviders} defaultValue={AIProviders[0]}>
                                                                <ComboboxInput className="w-fit" placeholder="Select a provider" />
                                                                <ComboboxContent>
                                                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                                                    <ComboboxList>
                                                                        {(item) => (
                                                                            <ComboboxItem key={item} value={item}>
                                                                                {item}
                                                                            </ComboboxItem>
                                                                        )}
                                                                    </ComboboxList>
                                                                </ComboboxContent>
                                                            </Combobox>
                                                            <FieldLabel>
                                                                API Key
                                                            </FieldLabel>
                                                            <InputGroup className="py-4">
                                                                <InputGroupInput type="password" id="AI_apiKey" placeholder="place here your api key" />
                                                                <InputGroupAddon align={'inline-end'}>
                                                                    <Button variant={'ghost'}><EyeOpenIcon /></Button>
                                                                </InputGroupAddon>
                                                            </InputGroup>
                                                            <FieldLabel htmlFor="AI_Model">Model</FieldLabel>
                                                            <Combobox id="AI_provider" items={OpenAIModels} defaultValue={OpenAIModels[0]}>
                                                                <ComboboxInput className="w-fit" placeholder="Select model" />
                                                                <ComboboxContent>
                                                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                                                    <ComboboxList>
                                                                        {(item) => (
                                                                            <ComboboxItem key={item} value={item}>
                                                                                {item}
                                                                            </ComboboxItem>
                                                                        )}
                                                                    </ComboboxList>
                                                                </ComboboxContent>
                                                            </Combobox>
                                                        </FieldGroup>
                                                    </FieldGroup>
                                                    <Separator className="h-0.5 w-full bg-accent" />

                                                    <FieldGroup>
                                                        <Field>
                                                            <FieldLabel>Default Language</FieldLabel>
                                                            <FieldContent className="flex justify-start flex-col items-start gap-3">

                                                                <LanguageSwitcher />
                                                            </FieldContent>
                                                        </Field>
                                                    </FieldGroup>
                                                </form>
                                            </div>
                                            <DialogFooter>
                                                <DialogClose render={<Button>Close</Button>}>

                                                </DialogClose>
                                                <Button>Save Changes</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <Separator className="my-0.5 bg-accent h-0.5" />

                                <div className="px-2">

                                    <a href="/logout">
                                        <Button
                                            variant="ghost"
                                            className="w-full flex justify-start py-2 items-center"
                                        >
                                            <LogOutIcon />
                                            Logout
                                        </Button>
                                    </a>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}