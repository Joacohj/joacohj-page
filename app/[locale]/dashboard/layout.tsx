
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { SidebarProvider, SidebarTrigger } from "@/app/components/ui/sidebar";
import Header from "../../../src/components/dashboard/components/dashboard-header";
import { AppSidebar } from "../../../src/components/dashboard/components/app-sidebar";
import { Toaster } from "@/app/components/ui/toast";
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