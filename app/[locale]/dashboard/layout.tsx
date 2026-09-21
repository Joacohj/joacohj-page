
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import Header from "@/components/layout/dashboard-header";
import { Toaster } from "@/components/ui/toast";
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "No mames mary jane",
    description: "A tu chingadera",
};

export default function DashboardLayout({
    children,
}: LayoutProps<"/[locale]">) {
    return <SidebarProvider>
        <AppSidebar />

        <SidebarTrigger />

        <main className="w-full">
            <Header />
            {children}

        </main>
        <Toaster />
    </SidebarProvider>
}