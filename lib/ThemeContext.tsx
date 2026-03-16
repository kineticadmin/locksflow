'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export interface ThemeTokens {
  bg: string
  bgCard: string
  bgSection: string
  bgSubtle: string
  bgSubtle2: string
  fg: string
  fgMuted: string
  fgDim: string
  fgVeryDim: string
  border: string
  borderMed: string
  borderStr: string
  isDark: boolean
}

const dark: ThemeTokens = {
  bg:         '#080808',
  bgCard:     '#0d0d0d',
  bgSection:  '#121212',
  bgSubtle:   'rgba(255,255,255,0.03)',
  bgSubtle2:  'rgba(255,255,255,0.05)',
  fg:         '#F2EDE5',
  fgMuted:    '#888',
  fgDim:      '#555',
  fgVeryDim:  'rgba(242,237,229,0.45)',
  border:     'rgba(255,255,255,0.07)',
  borderMed:  'rgba(255,255,255,0.12)',
  borderStr:  'rgba(255,255,255,0.2)',
  isDark:     true,
}

const light: ThemeTokens = {
  bg:         '#FAF7F2',
  bgCard:     '#EDE8E0',
  bgSection:  '#EDE8E0',
  bgSubtle:   'rgba(0,0,0,0.03)',
  bgSubtle2:  'rgba(0,0,0,0.05)',
  fg:         '#1A1209',
  fgMuted:    '#7A6E65',
  fgDim:      '#A09488',
  fgVeryDim:  'rgba(26,18,9,0.45)',
  border:     'rgba(0,0,0,0.08)',
  borderMed:  'rgba(0,0,0,0.12)',
  borderStr:  'rgba(0,0,0,0.18)',
  isDark:     false,
}

interface ThemeCtx extends ThemeTokens {
  toggle: () => void
}

const ThemeContext = createContext<ThemeCtx>({ ...dark, toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light') setIsDark(false)
  }, [])

  useEffect(() => {
    const tokens = isDark ? dark : light
    document.body.style.background = tokens.bg
    document.body.style.color = tokens.fg
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const tokens = isDark ? dark : light
  return (
    <ThemeContext.Provider value={{ ...tokens, toggle: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
