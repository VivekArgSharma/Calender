import { createContext, useContext, useMemo, useState } from 'react'
import { themes, themeOrder } from './themes'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(themeOrder[0])

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
