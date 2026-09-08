import Header from "../components/Header";

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
                <h4 className="font-normal text-xl">Latest changes</h4>
                <p className=" text-muted-foreground text-sm">Here will appear the latest changes.</p>
            </article>
        </section>
    </div>
}