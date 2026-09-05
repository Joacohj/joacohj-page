'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CaretDownIcon, DashboardIcon, HamburgerMenuIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ModeToggle } from "./theme-changer"
import { Button } from "@/components/ui/button"

export default function Header() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0)
        }

        window.addEventListener("scroll", handleScroll)

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    return (
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
                            <p>About</p>
                            <CaretDownIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <a className="w-full" href="#">Gallery</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <a className="w-full" href="#">Blog section</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <a className="w-full" href="#">Projects</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <a className="w-full" href="#">Contact</a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <nav className="hidden xl:flex gap-8 items-center">
                    <a href='#contact'>contact</a>
                    <a href='#contact'>blog</a>
                    <a href='#services'>services</a>
                    <Link className="flex items-center gap-2" href={"/dashboard"}><DashboardIcon />dashboard</Link>
                    <ModeToggle />
                </nav>
                <Button className='xl:hidden flex items-center text-foreground py-4 px-4 ' variant={"ghost"}>
                    <HamburgerMenuIcon  className="text-foreground scale-110"/>
                </Button>


            </div>
        </header>
    )
}