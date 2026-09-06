"use client"

import * as React from "react"

import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTranslations } from "next-intl"

export function ModeToggle() {
  const { setTheme } = useTheme()
  const t = useTranslations('ThemeChanger')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center bg-secondary p-2 rounded-md">
        <SunIcon className="text-foreground h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <MoonIcon className="text-foreground absolute h-[1.2rem] w-[1.2rem] scale-0  transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t('light')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {t('dark')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {t('system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
