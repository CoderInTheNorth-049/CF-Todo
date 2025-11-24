# Role
You are a Senior Frontend Engineer. I want you to build a "Spaced Repetition" style problem tracking application for Competitive Programming.

# Technical Stack Constraints
* **Framework:** Vite + React (TypeScript).
* **UI Library:** Ant Design (antd) v5.x. Use their components wherever possible (`Table`, `Modal`, `Form`, `Select`, `Input`, `InputNumber`, `Tag`, `Button`, `App/message` for notifications).
* **State Management (Client):** Redux Toolkit (RTK). This is the source of truth for the application state (table data, settings, notes).
* **State Management (Server/API):** TanStack React Query (v5). Used strictly for fetching data from external APIs.
* **Persistence:** Browser LocalStorage.
* **Markdown:** Use a third-party library (e.g., `@uiw/react-md-editor` or similar).
    * **CRITICAL REQUIREMENT:** Because markdown editors are heavy, this component *must* be code-split using `React.lazy` and `Suspense` so it is loaded as a separate JavaScript bundle only when the modal opens.
* **API:** Codeforces API (public).

# Application Workflow & Features

## 1. Initial Onboarding
* On first load, check LocalStorage for a `codeforces_username`.
* If none exists, show a simple screen asking the user to input their Codeforces handle.
* Save this to LocalStorage and continue to the main dashboard.

## 2. Main Dashboard - The Header (Data Ingestion)
* Display the stored username.
* Provide an input field accepting a URL string.
* **Auto-Fetch Logic:**
    * When a user pastes a link, detect if it is a Codeforces **Contest** link (e.g., `.../contest/1234`) or a **Single Problem** link (e.g., `.../problemset/problem/1234/A`).
    * Use **React Query** to fetch the data from the Codeforces API.
    * *Logic:* For contests, fetch the user's submission history to filter out problems they have already solved. Only add **unsolved** problems to Redux.
    * Automatically populate Name, Link, Rating, and Tags from the API data.

## 3. Main Dashboard - The Table (Core Feature)
The centerpiece is an Ant Design Table displaying the problems stored in Redux. The table supports a "View Mode" and an "Edit Mode" per row.

### Column Specifications:

* **Column 1: Problem Name & Details**
    * **View Mode:** Display the Problem Name as a clickable link opening the problem URL in a new tab.
    * **Edit Mode:** Replace the link with two stacked AntD Inputs: one for "Display Name" and one for "Actual URL".

* **Column 2: Rating**
    * **View Mode:** If rating is 0 or null, display text "Unrated". Otherwise, display the number.
    * **Edit Mode:** An AntD `InputNumber`. If it was "Unrated", show 0 in the input box initially. If the user types 0, it renders as "Unrated" in view mode.

* **Column 3: Tags (Complex UI Interaction)**
    * **View Mode:** Display AntD Tags. If the list is empty, show a single tag labeled "no tags for now".
    * **Edit Mode:** This requires a custom input component.
        * Show an Input field.
        * **Interaction - Shift+Enter:** Adds the text in the input to a "pending tags list" displayed below the input (with 'X' icons to remove them). Clears the input.
        * **Interaction - Enter:** Commits all "pending tags" to the row and exits the tag editing state.
        * Provide UI hints (e.g., placeholder "Shift+Enter to queue, Enter to save").

* **Column 4: Status (Selector)**
    * This column is **always active** (not dependent on Edit Mode).
    * It is a `Select` dropdown.
    * Options are populated from global settings stored in Redux.
    * **Default Values:** "to upsolve", "pending review", "mastered".

* **Column 5: Actions**
    * **Notes Icon:** Opens an AntD Modal containing the **lazy-loaded Markdown Editor**. User can read/write notes for the problem. Saving updates Redux.
    * **Row Edit Icon:** Toggles "Edit Mode" for columns 1, 2, and 3 for this specific row.
    * **Delete Icon:** Removes the row from Redux.

## 4. General Functionality
* **Manual Add:** Provide a button "Add Manually" that adds a blank row to the table in "Edit Mode", allowing the user to fill in details without an API fetch.

## 5. Settings & Status Management (Complex Logic)
* Provide a Settings Modal.
* Allow users to edit the list of available Status options (e.g., rename "mastered" to "done", add "skipped").
* **Destructive Warning:** If the user changes these status definitions, warn them that **this will invalidate the status of ALL problems currently in the table**.
* **Recovery UX:** If the user proceeds with the change:
    1.  Reset status of all problems to `null`.
    2.  Show a prominent "Bulk Update" tool above the table: *"Statuses reset. Select new status for all items: [Dropdown] [Apply Button]"*.

## 6. State Persistence strategy
* **Redux:** Holds the live state (rows, settings, notes).
* **LocalStorage:** Does *not* sync automatically on every keypress.
* **Sync Button:** A prominent button in the header "Sync to Local Storage".
    * Clicking it serializes the Redux state to LocalStorage.
    * Show an AntD success message upon completion.

# Deliverables
Please provide the following:
1.  **Project Structure:** Recommended folder layout for this feature set.
2.  **Redux Slices:** The code for `problemsSlice` and `settingsSlice`, handling the complex updates.
3.  **API Logic:** The utility function or hook to parse the URL and fetch from Codeforces.
4.  **Table Component:** The React component implementing the AntD table with the custom "Edit Mode" renderers and Tag input logic.
5.  **Lazy Markdown Component:** The implementation of the code-split editor.