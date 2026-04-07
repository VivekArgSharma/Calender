/calendar-app
├── /public
│   └── /models
│       ├── /theme-1-calm        ← coffee mug, table, plant
│       ├── /theme-2-sporty      ← cricket bat, ball, turf
│       └── /theme-3-[game]      ← your third theme assets
│
├── /src
│   ├── /themes
│   │   ├── /calm
│   │   │   ├── Scene.jsx        ← R3F 3D scene
│   │   │   └── tokens.js        ← colors, fonts, calendar skin
│   │   ├── /sporty
│   │   │   ├── Scene.jsx
│   │   │   └── tokens.js
│   │   └── /[game]
│   │       ├── Scene.jsx
│   │       └── tokens.js
│   │
│   ├── /components
│   │   ├── /calendar
│   │   │   ├── Calendar.jsx         ← root, holds all state
│   │   │   ├── MonthGrid.jsx        ← date cells, range logic
│   │   │   ├── DateCell.jsx         ← single day, hover/selected states
│   │   │   ├── MonthNav.jsx         ← prev/next with flip animation
│   │   │   └── RangeHighlight.jsx   ← the spreading selection animation
│   │   │
│   │   ├── /notes
│   │   │   ├── NotesPanel.jsx       ← sticky note UI
│   │   │   └── NoteCard.jsx         ← individual note
│   │   │
│   │   └── /ui
│   │       └── ThemeSwitcher.jsx    ← the 3-way toggle
│   │
│   ├── /hooks
│   │   ├── useCalendar.js       ← month nav, date generation
│   │   ├── useRangeSelect.js    ← start/end/hover range logic
│   │   └── useNotes.js          ← CRUD, localStorage persistence
│   │
│   ├── /lib
│   │   └── holidays.js          ← Indian public holidays data
│   │
│   ├── ThemeContext.jsx          ← active theme, switcher state
│   └── App.jsx                  ← Canvas + CalendarUI stacked
│
└── README.md