
import { Separator } from "@/components/ui/separator";
import Header from "../components/Header";
import { ChartBarDefault } from "../components/uploadthing-chart";

export default function OverviewPage() {
    
    return <div>
        <section className="w-full px-5 sm:px-15 xl:px-30 mt-20">

            <article className="flex flex-col my-5">
                <h4 className="font-normal text-4xl">Welcome In, Joaco.</h4>
                <p className="text-xl text-muted-foreground">Dashboard Overview</p>
            </article>

        </section>
        <section className="w-full px-5 sm:px-15 xl:px-30 mt-20">
            <article className="flex flex-col my-5 bg-accent border-border w-fit p-4 rounded-xl shadow">
                <h4 className="font-normal text-xl">Uploadthing Usage</h4>
                <p className=" text-muted-foreground text-sm">Showing upload usage history for the last month</p>
                <Separator className="w-full h-0.5 bg-input my-3"/>
                <div>
                    <ChartBarDefault/>
                </div>
            </article>
        </section>
        <section className="w-full px-5 sm:px-15 xl:px-30 mt-10">
            <article className="flex flex-col my-5 bg-accent border-border w-fit p-4 rounded-xl shadow">
                <h4 className="font-normal text-xl">Latest changes</h4>
                <p className=" text-muted-foreground text-sm">Here will appear the latest changes.</p>
            </article>
        </section>
    </div>
}