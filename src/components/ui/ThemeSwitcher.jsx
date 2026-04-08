import { useState } from 'react'
import { useTheme } from '../../ThemeContext'

export default function ThemeSwitcher({ isMobile = false, isTablet = false, isTabletLandscape = false }) {
  const { activeTheme, setActiveTheme, themeOrder, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  function handleSelect(themeId) {
    setActiveTheme(themeId)
    setIsOpen(false)
  }

  return (
    <div className="theme-picker-wrap">
      <button
        type="button"
        className="theme-picker-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {isMobile && !isTablet ? 'Theme' : isTabletLandscape ? 'Themes & Rooms' : 'Themes'}
      </button>

      {isOpen ? (
        <div className="theme-picker-modal" role="dialog" aria-label="Choose theme">
          <div className="theme-picker-list">
            {themeOrder.map((themeId) => {
              const isActive = themeId === activeTheme

              return (
                <button
                  key={themeId}
                  type="button"
                  className={`theme-option${isActive ? ' is-active' : ''}`}
                  onClick={() => handleSelect(themeId)}
                >
                  {themes[themeId].label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
