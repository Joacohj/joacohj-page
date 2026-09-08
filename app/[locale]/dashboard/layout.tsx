
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/Providers/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Header from "./components/Header";
import { AppSidebar } from "./components/app-sidebar";
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

export default function RootLayout({ children }: LayoutProps<"/[locale]">) {
    return (
        <html
            suppressHydrationWarning
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <NextIntlClientProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >

                        <SidebarProvider>
                            <AppSidebar />
                            <SidebarTrigger />
                            <main className="w-full">
                                <Header />

                                {children}
                            </main>
                        </SidebarProvider>

                    </ThemeProvider>
                </NextIntlClientProvider></body>
        </html>
    );
}
