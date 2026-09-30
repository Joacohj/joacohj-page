'use client'
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagnifyingGlassIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Filter, FilterIcon, FilterXIcon } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { DatePickerDemo } from "@/components/shared/date-picker";
import { BasicMasonry } from "@/components/shared/masonry/site-post-preview-masonry";
import Header from "@/components/layout/site-header";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { Skeleton } from "@/components/ui/skeleton";
type Category = {
    id: string,
    title: string,
}
type FilterStoreState = {
    enabled: boolean;
    results: number;
    search: string;
    date: Date | null;
    category: Category;
    categories: Category[]
}



type FilterStoreActions = {
    setEnabled: (enabled: boolean) => void,
    setResults: (results: number) => void,
    setSearch: (search: string) => void,
    setDate: (date: Date) => void
    setCategory: (category: Category) => void
    setCategories: (categories: Category[]) => void
}
export type FilterStore = FilterStoreState & FilterStoreActions;
export const useFilterStore = create<FilterStore>()((set) => ({
    enabled: false,
    results: 0,
    categories: [],
    search: "",
    category: { id: "", title: "" },
    date: null,
    setEnabled: (enabled) => { set(() => ({ enabled: enabled })) },
    setResults: (results) => { set(() => ({ results: results })) },
    setSearch: (search) => { set(() => ({ search: search })) },
    setCategory: (category) => { set(() => ({ category: category })) },
    setCategories: (categories) => { set(() => ({ categories: categories })) },
    setDate: (date) => { set(() => ({ date: date })) },
}))

export default function FeedPage() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState<boolean>(true)
    const router = useRouter();
    const setSearch = useFilterStore((state) => state.setSearch);

    const enabled = useFilterStore((state) => state.enabled);
    const results = useFilterStore((state) => state.results);
    const date = useFilterStore((state) => state.date);
    const search = useFilterStore((state) => state.search);

    const setEnabled = useFilterStore((state) => state.setEnabled);
    const category = useFilterStore((state) => state.category);

    const setCategory = useFilterStore((state) => state.setCategory);
    const categories = useFilterStore((state) => state.categories);
    const setDate = useFilterStore((state) => state.setDate);
    const setCategories = useFilterStore((state) => state.setCategories);
    const id = searchParams.get("id");

    useEffect(() => {
        if (!id) return;
        router.replace("/gallery/feed")
        router.push(`/gallery/feed/${id}?from=site`);
    }, [id, router]);
    function handleReload(): void {
        setSearch("")
        setDate(new Date)
        setEnabled(false)
    }



    async function getCategories() {
        try {
            const response = await fetch("/api/data/categories", {
                cache: 'no-store'
            })

            const data = await response.json();
            const categories: Category[] = data.categories.map((category: Category) => {
                return {
                    id: category.id,
                    title: category.title
                }
            })

            setCategories(categories);

        } catch (error) {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getCategories();
    }, [])
    return <div>
        <Header />
        <section className="w-full px-5 sm:px-15 xl:px-30 mt-20">
            <article className="flex flex-col my-5">
                <h4 className="text-2xl font-semibold sm:text-4xl">Feed</h4>
                <p className="text-muted-foreground text-xl font-light w-2/3    ">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium amet aliquid inventore fugit nihil ratione obcaecati rerum nisi voluptate, quae deleniti dolore tenetur nam! A dolores molestias perferendis reiciendis impedit.</p>
            </article>

            <div className="w-full flex items-center justify-between mt-10">
                {loading ? <Skeleton className="w-1/2 h-8 bg-accent " /> : <Tabs onValueChange={(value) => setCategory({ id: value, title: categories.slice(0, 5).find(category => category.id === value)?.title ?? "" })} defaultValue={categories[0]}>
                    <TabsList variant="line">
                        {categories.slice(0, 5).map(category => (<TabsTrigger key={category.id} value={category.id}>{category.title}</TabsTrigger>))}
                    </TabsList>
                </Tabs>}
                <div className="flex gap-2">
                    <Popover >
                        <PopoverTrigger render={<Button className="px-5 flex items-center"><FilterIcon />Filter</Button>} />

                        <PopoverContent align="end" className='px-5 py-3'>
                            <PopoverHeader>
                                <PopoverTitle className='text-xl font-bold'>
                                    Filters
                                </PopoverTitle>
                                <PopoverDescription>
                                    Lorem ipsum dolor sit amet consectetur.
                                </PopoverDescription>
                                <div className="w-full mt-5 flex flex-col gap-4">
                                    <p className="text-muted-foreground -mt-2">Category <span className="py-1 px-3 bg-accent text-accent-foreground rounded-lg font-light border-input">{category.title}</span></p>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="airplane-mode" checked={enabled} onCheckedChange={(checked => setEnabled(checked))} />
                                        <Label htmlFor="airplane-mode">Enable Filters</Label>

                                    </div>
                                    <InputGroup className="max-w-xs">
                                        <InputGroupInput disabled={!enabled} value={search} onChange={({ target }) => setSearch(target.value ?? "")} placeholder="Search..." />
                                        <InputGroupAddon>
                                            <MagnifyingGlassIcon />
                                        </InputGroupAddon>
                                        <InputGroupAddon align="inline-end">{results} results</InputGroupAddon>
                                    </InputGroup>
                                    <DatePickerDemo disabled={!enabled} date={date ?? new Date()} setDate={setDate} />
                                </div>
                            </PopoverHeader>

                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleReload}><ReloadIcon /></Button>
                </div>
            </div>
            <article className="w-full mt-5">
                <BasicMasonry limit={0} allowFilters={true} />
            </article>

        </section>
        <footer className="w-full mt-10 bg-background border-accent border py-10">
            <p className="text-center  text-muted-foreground">Made with love by Joaquin Alvarez ❤</p>
            <nav className="flex w-full justify-center gap-4 text-muted-foreground">
                <a href="">about</a>
                <a href="">gallery</a>
                <a href="">blog</a>
                <a href="">projects</a>
            </nav>
        </footer>
    </div>
}