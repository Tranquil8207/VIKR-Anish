"use client"

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{ theme: Theme, toggleTheme: () => void }>({
    theme: 'light',
    toggleTheme: () => { }
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem('theme') as Theme | null
        if (stored) {
            setTheme(stored)
            if (stored === 'dark') document.documentElement.classList.add('dark')
            else document.documentElement.classList.remove('dark')
        } else {
            // Default is light (un-set dark)
            document.documentElement.classList.remove('dark')
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    // Prevent hydration mismatch by returning empty or standard wrapper initially,
    // but since we render generic classNames in Next.js, skipping children entirely 
    // breaks server rendering SEO. So we render it.
    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
