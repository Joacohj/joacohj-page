import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChartBarDefault } from "@/features/dashboard/uploadthing-usage-chart";
import NewsletterSubscriptors from "@/features/newsletter/newsletter-subscribers";
import { Link } from "@/i18n/navigation";
import { Link1Icon, Share1Icon } from "@radix-ui/react-icons";


export default function OverviewPage() {

    return <div className="">
        <section className="w-full px-5 sm:px-15 xl:px-30 mt-20">

            <article className="flex flex-col my-5">
                <h4 className="font-normal text-4xl">Welcome In, Joaco.</h4>
                <p className="text-xl text-muted-foreground">Dashboard Overview</p>

            </article>

        </section>
        <div className="gap-10 items-start flex flex-wrap px-5 sm:px-15 xl:px-30 mt-20">
            <section>
                <article className="flex flex-col my-5 bg-accent border-border w-fit p-4 rounded-xl shadow">
                    <div className="flex relative  items-center gap-2 " >
                        <h4 className="font-normal text-xl">Uploadthing Usage</h4>
                   <Button variant={"link"}> <Link target="_blank" href="https://uploadthing.com/dashboard/joacohj-personal-team/7m6psj2yzx/files"><Link1Icon/></Link></Button>
                    </div>
                    <p className=" text-muted-foreground text-sm">Showing upload usage history for the last month</p>
                    <Separator className="w-full h-0.5 bg-input my-3" />
                    <div>
                        <ChartBarDefault />
                    </div>
                </article>
            </section>
                    <section className="">
                <article className="flex flex-col my-5 bg-accent border-border w-fit p-4 rounded-xl shadow">
                    <h4 className="font-normal text-xl">Newsletter subscriptors</h4>
                    <p className=" text-muted-foreground text-sm">A list of every subscriptor of the newsletter.</p>
                    <Separator className="w-full h-0.5 bg-input my-3" />
                    <NewsletterSubscriptors />
                </article>
            </section>
            <section className="">
                <article className="flex flex-col my-5 bg-accent border-border w-fit p-4 rounded-xl shadow">
                    <h4 className="font-normal text-xl">Latest changes</h4>
                    <p className=" text-muted-foreground text-sm">Here will appear the latest changes.</p>
                </article>
            </section>
        </div>
    </div>
}