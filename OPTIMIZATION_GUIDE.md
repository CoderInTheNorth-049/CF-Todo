# React Performance Optimization Guide

This document explains the optimization strategies used in the CF Spaced Repetition Tracker to minimize unnecessary re-renders and improve performance.

---

## 1. React.memo - Component Memoization

### What it does:

Prevents a component from re-rendering if its props haven't changed.

### Where we use it:

#### Header Component

```javascript
const Header = memo(({ onSettingsClick }) => {
  // Component logic
})

Header.displayName = 'Header'
```

**Why:** Header is at the top level and receives props. Without memo, it would re-render every time Redux state changes anywhere in the app.

#### ProblemsTable and Sub-Components

```javascript
const ProblemsTable = memo(({ onNotesClick }) => {
  // Component logic
})

const ProblemNameView = memo(({ name, url }) => <a href={url}>{name}</a>)

const RatingView = memo(({ rating }) => (
  <span>{rating === 0 ? 'Unrated' : rating}</span>
))
```

**Why:** Table renders many rows. Each cell component memoized prevents re-renders when other cells change.

#### SettingsModal & BulkUpdateBanner

```javascript
const SettingsModal = memo(({ open, onClose }) => {
  // Component logic
})

const BulkUpdateBanner = memo(() => {
  // Component logic
})
```

**Why:** These modals/banners shouldn't re-render when table data changes.

---

## 2. useCallback - Function Memoization

### What it does:

Memoizes function references so they don't change on every render.

### Where we use it:

#### ProblemsTable Handlers

```javascript
const handleEdit = useCallback(record => {
  setEditingRowId(record.id)
  setEditData({ ...record })
}, []) // No dependencies - function never changes

const handleSave = useCallback(
  id => {
    dispatch(updateProblem({ id, updates: editData }))
    setEditingRowId(null)
    message.success('Problem updated!')
  },
  [editData, dispatch, message]
) // Re-create only if these change

const handleStatusChange = useCallback(
  (id, status) => {
    dispatch(updateProblem({ id, updates: { status } }))
  },
  [dispatch]
)
```

**Why:** These functions are passed to memoized child components. Without useCallback, the function reference changes on every render, causing children to re-render even though they're memoized.

### The Pattern:

```javascript
// ❌ BAD: Function reference changes every render
const Child = memo(({ onClick }) => <button onClick={onClick} />)

function Parent() {
  const handleClick = () => console.log('clicked') // New function every render
  return <Child onClick={handleClick} /> // Child re-renders unnecessarily
}

// ✅ GOOD: Function reference stays stable
const Child = memo(({ onClick }) => <button onClick={onClick} />)

function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, []) // Same function reference
  return <Child onClick={handleClick} /> // Child doesn't re-render
}
```

---

## 3. useSelector - Selective Redux Subscription

### What it does:

Subscribes only to specific parts of Redux state.

### Where we use it:

#### Specific Selectors

```javascript
// ✅ GOOD: Only re-renders when username changes
const username = useSelector(state => state.settings.username)

// ✅ GOOD: Only re-renders when problems array changes
const problems = useSelector(state => state.problems.problems)

// ✅ GOOD: Only re-renders when statusOptions changes
const statusOptions = useSelector(state => state.settings.statusOptions)
```

#### What to avoid:

```javascript
// ❌ BAD: Re-renders on ANY Redux state change
const state = useSelector(state => state)
const username = state.settings.username

// ❌ BAD: Creates new object every time, always triggers re-render
const settings = useSelector(state => ({
  username: state.settings.username,
  statusOptions: state.settings.statusOptions,
}))
```

---

## 4. Code Splitting - Lazy Loading

### What it does:

Loads heavy components only when needed, not on initial page load.

### Where we use it:

#### Markdown Editor

```javascript
// NotesModal.jsx
import { lazy, Suspense } from 'react'

// ✅ Loaded only when modal opens
const MDEditor = lazy(() => import('@uiw/react-md-editor'))

function NotesModal({ open, problem }) {
  return (
    <Modal open={open}>
      <Suspense fallback={<div>Loading editor...</div>}>
        <MDEditor value={problem.notes} />
      </Suspense>
    </Modal>
  )
}
```

**Why:** The markdown editor is ~200KB. Most users won't open notes immediately, so we don't load it until needed.

**Result:** Initial bundle size reduced by ~200KB!

---

## 5. Local State vs Redux State

### Strategy:

Keep UI-only state local to components.

### Examples:

#### Local State (Component-level)

```javascript
// ProblemsTable.jsx
const [editingRowId, setEditingRowId] = useState(null) // UI state
const [editData, setEditData] = useState({}) // Temporary edit data
```

**Why:** This state is only relevant to the table component. No need for Redux.

#### Redux State (Global)

```javascript
// store/problemsSlice.js
problems: [], // Shared across components
```

**Why:** Multiple components need this data (table, header sync button, bulk update).

### Rule of Thumb:

- **Local state:** UI state, temporary data, component-specific
- **Redux state:** Shared data, persisted data, cross-component communication

---

## 6. React Query - Server State

### What it does:

Manages API calls with caching, retries, and background updates.

### Where we use it:

```javascript
// hooks/useCodeforcesProblems.js
export const useCodeforcesProblems = (url, username, enabled) => {
  return useQuery({
    queryKey: ['codeforces', url, username],
    queryFn: async () => {
      // Fetch logic
    },
    enabled: enabled && !!url,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
```

**Benefits:**

- ✅ Automatic caching (same URL won't refetch for 5 minutes)
- ✅ Background refetch disabled (no unnecessary network calls)
- ✅ Retry logic for failed requests
- ✅ Loading/error states built-in

**Why not Redux for API data?**
Redux is for client state. React Query handles server state better with built-in features.

---

## 7. Avoiding Re-renders: Complete Pattern

### Example: ProblemsTable

```javascript
// 1. Memoize the component
const ProblemsTable = memo(({ onNotesClick }) => {
  // 2. Use specific selectors
  const problems = useSelector(state => state.problems.problems)
  const statusOptions = useSelector(state => state.settings.statusOptions)

  // 3. Memoize handlers
  const handleEdit = useCallback(record => {
    // ...
  }, [])

  const handleSave = useCallback(
    id => {
      // ...
    },
    [editData, dispatch]
  )

  // 4. Memoize sub-components
  const ProblemNameView = memo(({ name, url }) => <a href={url}>{name}</a>)

  return <Table>{/* Render with memoized components */}</Table>
})
```

---

## 8. Performance Measurement

### How to check if optimizations work:

#### React DevTools Profiler

1. Install React DevTools extension
2. Open Profiler tab
3. Click "Record"
4. Interact with app
5. Stop recording
6. Check which components re-rendered

#### Console Logging

```javascript
const ProblemsTable = memo(({ onNotesClick }) => {
  console.log('ProblemsTable rendered')
  // Component logic
})
```

**Test:** Change a single cell → only that cell should log, not the whole table.

---

## 9. Common Pitfalls & Solutions

### Pitfall 1: Inline Objects/Arrays

```javascript
// ❌ BAD: Creates new object every render
;<Component style={{ padding: 20 }} />

// ✅ GOOD: Define outside or use useMemo
const style = { padding: 20 }
;<Component style={style} />
```

### Pitfall 2: Inline Functions

```javascript
// ❌ BAD: New function every render
;<Button onClick={() => handleClick(id)} />

// ✅ GOOD: Use useCallback or pass directly
const handleClick = useCallback(() => doSomething(id), [id])
;<Button onClick={handleClick} />
```

### Pitfall 3: Object Selectors

```javascript
// ❌ BAD: New object every time, always triggers re-render
const data = useSelector(state => ({
  name: state.name,
  age: state.age,
}))

// ✅ GOOD: Separate selectors
const name = useSelector(state => state.name)
const age = useSelector(state => state.age)
```

---

## 10. When NOT to Optimize

### Don't over-optimize:

- Simple components that render fast
- Components that rarely render
- Components with few props

### Example: Not worth optimizing

```javascript
// This is fine without memo - it's simple and rarely changes
function Footer() {
  return <div>© 2025 CF Tracker</div>
}
```

---

## Summary: Optimization Checklist

- ✅ **Use React.memo** for components that receive props
- ✅ **Use useCallback** for functions passed to memoized components
- ✅ **Use specific useSelector** instead of selecting entire state
- ✅ **Use lazy + Suspense** for heavy components
- ✅ **Keep local state local** - only use Redux for shared state
- ✅ **Use React Query** for server state
- ✅ **Avoid inline objects/arrays/functions** in props
- ✅ **Test with React DevTools Profiler**

---

## Result in Our App

### Without optimizations:

- Typing in one cell → entire table re-renders (100+ rows)
- Opening settings → header re-renders
- Markdown editor loaded on page load → 200KB bundle

### With optimizations:

- ✅ Typing in one cell → only that cell re-renders
- ✅ Opening settings → only modal renders
- ✅ Markdown editor → lazy loaded, saves 200KB initially
- ✅ API calls cached for 5 minutes
- ✅ Fast, smooth user experience

---

**Remember:** Premature optimization is the root of all evil, but these patterns are best practices for React apps at scale! 🚀
