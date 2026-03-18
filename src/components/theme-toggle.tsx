"use client"

import { useTheme } from "./theme-provider"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 bg-bg-card border border-border-subtle rounded-md text-text-main font-bold hover:bg-bg-hover shadow-sm transition-colors duration-200"
        >
            {isDark ? <Sun className="w-3.5 h-3.5 text-brand-accent" /> : <Moon className="w-3.5 h-3.5 text-brand-accent" />}
            <span className="text-xs uppercase tracking-wide">{isDark ? "Light" : "Dark"}</span>
        </button>
    )
}
