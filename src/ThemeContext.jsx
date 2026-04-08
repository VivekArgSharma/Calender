import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { themes, themeOrder } from './themes'

const THEME_STORAGE_KEY = 'calendar-theme'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      return saved && themes[saved] ? saved : themeOrder[0]
    } catch {
      return themeOrder[0]
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, activeTheme)
    } catch {}
  }, [activeTheme])

  const value = useMemo(
    () => ({
      activeTheme,
      setActiveTheme,
      themes,
      themeOrder,
      activeThemeConfig: themes[activeTheme],
    }),
    [activeTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
