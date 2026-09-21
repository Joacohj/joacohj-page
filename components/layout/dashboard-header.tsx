'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { CaretDownIcon, HamburgerMenuIcon } from "@radix-ui/react-icons"

import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/navigation"
import { Button } from "../ui/button";
import { ModeToggle } from "./theme-changer";
export default function Header() {
    const t = useTranslations('Header')

    return (
        <div>
            <header
                className={`
        w-full h-20 px-5 sm:px-15 xl:px-30
        text-foreground  bg-background z-50
        transition-all duration-300 ease
        flex items-center
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
                                    <a className="w-full" href="#">Overview</a>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <a className="w-full" href="#">Blog</a>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <a className="w-full" href="#">Projects</a>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <a className="w-full" href="#">Feed</a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <nav className="hidden xl:flex gap-8 items-center">
                        <Link href='/dashboard/overview'>Overview</Link>
                        <Link href='#contact'>{t('blog')}</Link>
                        <Link href='#services'>{t('services')}</Link>
                        <Link href="/dashboard/feed/gallery/overview">Feed</Link>
                        <ModeToggle />
                    </nav>
                    <Button className='xl:hidden flex items-center text-foreground py-4 px-4 ' variant={"ghost"}>
                        <HamburgerMenuIcon className="text-foreground scale-110" />
                    </Button>


                </div>
            </header>
        </div>
    )
}