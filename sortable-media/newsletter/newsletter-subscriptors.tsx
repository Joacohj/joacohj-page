'use client'
import { Skeleton } from "@/app/components/ui/skeleton"
import { useEffect, useState } from "react"
type Subscriptor = {
    email: string,
    id: string
}

export default function NewsletterSubscriptors() {
    const [loading, setLoading] = useState<boolean>(true);
    const [subscriptors, setSubscriptors] = useState<Subscriptor[]>([])

    useEffect(() => {
        const getSubscriptors = async () => {
            try {
                const response = await fetch('/api/newsletter/subscriptors', {
                    cache: 'no-store'
                });
                const data = await response.json();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setSubscriptors(data?.map((subscriptor: any) => {
                    return { email: subscriptor.email, id: subscriptor.id }
                }))
            } catch (error) {
                console.log(error)
            } finally {
            setLoading(false);

            }

        }
        getSubscriptors();
    }, [])
    if (loading)
        return <div className="w-full flex flex-col gap-2">
            <Skeleton className="w-full h-8 py-4  bg-muted-foreground/10" />
            <Skeleton className="w-full h-8 py-4  bg-muted-foreground/10" />
            <Skeleton className="w-full h-8 py-4  bg-muted-foreground/10" />
            <Skeleton className="w-full h-8 py-4  bg-muted-foreground/10" />
        </div>
    return <div className=" flex flex-col gap-2 max-h-[200px] scrollbar-none overflow-auto">
        {subscriptors.map(subscriptor => <p className="text-muted-foreground text-sm" key={subscriptor.id}>{subscriptor.email}</p>)}
    </div>
}