"use client"
import { Link } from "@/i18n/navigation";
import { CalendarIcon, ImageIcon } from "@radix-ui/react-icons";
import { useLocale } from "next-intl";
type Post = {
    banner: string;
    createdAt: Date;
    id: string;
    title: string;
    description: string;
}
export function Post({ banner, createdAt, id, title, description }: Post) {
    const date = new Date(createdAt);
    const locale = useLocale();
    const formattedDate = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
    }).format(date);
    return <article className="w-full min-h-40 border-border border overflow-hidden rounded-xl bg-card grid xl:grid-cols-[1fr_250px]">
        <div className="order-2 xl:order-1 w-full px-10 py-5">
            <div className="xl:w-1/4 mt-2">
                <Link href={`/blog/posts/${id}`} className="text-xl text-muted-foreground">{title}</Link>
                <div className="h-0.5 w-full bg-accent my-2"></div>
            </div>
            <time className="flex items-center gap-1.5 text-muted-foreground my-1"><span><CalendarIcon /></span>{formattedDate}</time>
            <p className="line-clamp-1 w-2/3 text-muted-foreground font-light ">{description}</p>
        </div>
        <div className="order-1 xl:order-2 w-full h-[200px] xl:h-full bg-accent overflow-hidden flex justify-center items-center rounded-xl border-border border shadow-sm" >
            <img src={banner} alt={title} className="w-full h-full object-cover" />
        </div>
    </article>
}