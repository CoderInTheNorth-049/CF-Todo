# CF Spaced Repetition Tracker 🚀

A powerful **Spaced Repetition** style problem tracking application for Competitive Programming, specifically designed for Codeforces problems.

## 🌟 Features

### 1. **Smart Problem Ingestion**

- Paste Codeforces contest or problem URLs directly
- Automatically fetches problem details (name, rating, tags)
- For contests: filters out already solved problems using your submission history
- Auto-detects URL type (contest vs single problem)

### 2. **Advanced Table Management**

- **Edit Mode**: Toggle individual rows to edit problem name, URL, rating, and tags
- **Custom Tag Input**:
  - Press `Shift+Enter` to queue tags
  - Press `Enter` to save all queued tags
- **Status Tracking**: Always-active dropdown to track problem status
- **Notes**: Markdown-powered notes with lazy-loaded editor (code-split for performance)

### 3. **Flexible Status Management**

- Customizable status options (default: "to upsolve", "pending review", "mastered")
- Settings modal to add/remove status options
- **Destructive Warning**: Changing statuses resets all problem statuses
- **Bulk Update Tool**: After status reset, quickly reassign status to all problems

### 4. **Persistence Strategy**

- Redux as single source of truth for app state
- Manual sync to LocalStorage via "Sync to Local Storage" button
- Prevents unnecessary writes on every keystroke
- Auto-loads state on app startup

### 5. **Performance Optimizations**

- React.memo on all major components to prevent unnecessary re-renders
- useCallback for event handlers
- Code-splitting: Markdown editor loaded only when notes modal opens
- TanStack Query for efficient API caching (5-minute stale time)

## 🛠️ Technology Stack

- **Frontend Framework**: Vite + React
- **UI Library**: Ant Design (antd) v5.x
- **State Management**:
  - Redux Toolkit (client state)
  - TanStack React Query v5 (server/API state)
- **Persistence**: Browser LocalStorage
- **Markdown**: @uiw/react-md-editor (lazy-loaded)
- **API**: Codeforces Public API

## 📁 Project Structure

```
src/
├── components/
│   ├── Onboarding.jsx          # Initial username input screen
│   ├── Header.jsx              # Top bar with URL input & controls
│   ├── ProblemsTable.jsx       # Main table with edit mode
│   ├── NotesModal.jsx          # Lazy-loaded markdown editor
│   ├── SettingsModal.jsx       # Status management settings
│   └── BulkUpdateBanner.jsx    # Status reset recovery UI
├── store/
│   ├── index.js                # Redux store configuration
│   ├── problemsSlice.js        # Problems state & reducers
│   └── settingsSlice.js        # Settings state & reducers
├── hooks/
│   └── useCodeforcesProblems.js # React Query hook for API
├── utils/
│   └── codeforcesApi.js        # API utility functions
├── constants/
│   └── defaultStatuses.js      # Default status options
├── App.jsx                      # Main app component
├── main.jsx                     # Entry point
└── index.css / App.css         # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd CF-Todo
```

2. Install dependencies

```bash
npm install
```

3. Start development server

```bash
npm run dev
```

4. Open browser at `http://localhost:5173`

### First Use

1. Enter your Codeforces handle on the onboarding screen
2. Start adding problems by:
   - Pasting a contest URL (e.g., `https://codeforces.com/contest/1234`)
   - Pasting a problem URL (e.g., `https://codeforces.com/problemset/problem/1234/A`)
   - Clicking "Add Manually" for custom problems

## 📖 Usage Guide

### Adding Problems

**Contest URL**: Paste a contest link, and the app will:

- Fetch all problems in the contest
- Check your submission history
- Add only unsolved problems

**Single Problem**: Paste a problem link to add it directly

**Manual Add**: Click "Add Manually" to create a blank row

### Editing Problems

1. Click the **Edit** icon (pencil) on any row
2. Edit name, URL, rating, and tags
3. For tags:
   - Type a tag, press `Shift+Enter` to queue it
   - Press `Enter` to save all queued tags
4. Click **Save** (checkmark) or **Cancel** (X)

### Managing Status

- Use the dropdown in each row to set status
- Status is always active (no edit mode needed)
- Customize available statuses in Settings

### Writing Notes

1. Click the **Notes** icon (document) on any row
2. Write markdown notes in the editor
3. Changes auto-save to Redux state
4. Sync to LocalStorage when ready

### Syncing to LocalStorage

Click **"Sync to Local Storage"** button in the header to persist your data.

### Changing Status Options

1. Click **Settings** in the header
2. Add or remove status options
3. **Warning**: This will reset all problem statuses
4. Use the **Bulk Update Banner** to reassign statuses quickly

## 🎯 Key Design Decisions

### 1. **Manual LocalStorage Sync**

- Prevents performance issues from constant writes
- User controls when to persist data
- Clear feedback via success messages

### 2. **Lazy-Loaded Markdown Editor**

- Heavy component (~200KB)
- Loaded only when notes modal opens
- Improves initial page load time

### 3. **Memoization Strategy**

- All major components wrapped in React.memo
- useCallback for handlers passed as props
- useSelector with specific selectors to prevent re-renders

### 4. **Destructive Action Warnings**

- Modal confirmation before changing status options
- Clear explanation of consequences
- Recovery mechanism (bulk update tool)

### 5. **API State vs Client State Separation**

- React Query for external API data (caching, retries)
- Redux for application state (problems, settings)
- Clean separation of concerns

## 🐛 Troubleshooting

### Problems not loading

- Check console for API errors
- Verify Codeforces username is correct
- Ensure URL format is correct

### Status reset unexpectedly

- This happens when you change status options in Settings
- Use the Bulk Update Banner to quickly reassign statuses

### Data not persisting

- Remember to click "Sync to Local Storage"
- Check browser localStorage is enabled
- Look for console errors

## 🔧 Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow React best practices and maintain the memoization strategy.

---

**Happy Problem Solving! 🎯**
