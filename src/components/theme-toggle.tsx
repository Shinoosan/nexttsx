// components/theme-toggle.tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  { name: "light", label: "Light" },
  { name: "dark", label: "Dark" },
  { name: "dim", label: "Dim" },
  { name: "forest", label: "Forest" },
  { name: "sunset", label: "Sunset" },
  { name: "midnight", label: "Midnight" },
  { name: "ocean", label: "Ocean" },
  { name: "coffee", label: "Coffee" },
  { name: "rose", label: "Rose" },
  { name: "cyberpunk", label: "Cyberpunk" },
  { name: "system", label: "System" },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (newTheme: string) => {
    // First, remove all possible theme classes
    const html = document.documentElement
    themes.forEach((t) => {
      html.classList.remove(t.name)
    })

    // Force a clean state
    html.classList.remove('light', 'dark')
    
    // Apply new theme
    setTheme(newTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.name}
            onClick={() => handleThemeChange(t.name)}
            className={theme === t.name ? "bg-accent" : ""}
          >
            {t.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}