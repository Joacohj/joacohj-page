'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CaretDownIcon, DashboardIcon, HamburgerMenuIcon } from "@radix-ui/react-icons"
import { useEffect, useRef, useState } from "react"
import { ModeToggle } from "./theme-changer"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"
import {useTranslations} from 'next-intl';
import { Link } from "../i18n/navigation"
export default function Header({ enableProgress = false }: { enableProgress?: boolean }) {
    const t = useTranslations('Header')
    const [scrolled, setScrolled] = useState(false)
    const [scrollPercentaje, setScrolledPercentaje] = useState(0);
    const hasConfetti = useRef(false)
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0)
        }

        const handleScrollPercentaje = () => {
            const maxScroll =
                document.documentElement.scrollHeight - window.innerHeight;

            const progress = Math.ceil((window.scrollY / maxScroll) * 100);

            if (progress >= 99.5 && !hasConfetti.current && enableProgress) {
                hasConfetti.current = true;

                confetti({
                    particleCount: 150,
                    spread: 50,

                    origin: {
                        y: 0.6,

                    },
                });
            }

            if (progress < 95) {
                hasConfetti.current = false;
            }
            setScrolledPercentaje(progress)
        }

        window.addEventListener("scroll", handleScroll)
        window.addEventListener('scroll', handleScrollPercentaje)

        return () => {
            window.removeEventListener("scroll", handleScroll)
            window.removeEventListener("scroll", handleScrollPercentaje)

        }
    }, [])

    return (
        <div>
            <header
                className={`
        w-full h-20 px-5 sm:px-15 xl:px-30
        text-foreground  bg-background z-50
        transition-all duration-300 ease
        ${scrolled ? "fixed top-0 left-0 my-0 shadow-2xs shadow-accent" : "flex items-center"}
      `}
            >
                <div className="w-full h-full items-center flex justify-between">
                    <div className="flex gap-2">
                        <Link href={"/"}>Joacohj</Link>
                        <p>/</p>
                        <DropdownMenu>
                            <DropdownMenuTrigger className='flex items-center'>
                                <p>{t('about')}</p>
                                <CaretDownIcon />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <a className="w-full" href="#">{t('gallery')}</a>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <a className="w-full" href="#">{t('blogSection')}</a>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <a className="w-full" href="#">{t('projects')}</a>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <a className="w-full" href="#">{t('contact')}</a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <nav className="hidden xl:flex gap-8 items-center">
                        <a href='#contact'>{t('contact')}</a>
                        <a href='#contact'>{t('blog')}</a>
                        <a href='#services'>{t('services')}</a>
                        <Link className="flex items-center gap-2" href={"/dashboard"}><DashboardIcon />{t('dashboard')}</Link>
                        <ModeToggle />
                    </nav>
                    <Button className='xl:hidden flex items-center text-foreground py-4 px-4 ' variant={"ghost"}>
                        <HamburgerMenuIcon className="text-foreground scale-110" />
                    </Button>


                </div>
            </header>
            <Progress value={scrollPercentaje} className={cn(scrolled ? 'fixed top-20 h-0.5 z-30 bg-accent w-full left-0 my-0 flex' : 'hidden', enableProgress ? '' : 'hidden')} />
        </div>
    )
}