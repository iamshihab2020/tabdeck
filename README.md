# ⚡ TabDeck

**A beautiful, feature-packed new tab page for Chrome.**  
Every time you open a new tab, TabDeck replaces the default blank page with your own personal productivity dashboard — bookmarks, notes, tasks, weather, and more, all in one place.

> Built with ❤️ by [Shihab Hossain](https://www.linkedin.com/in/sheikh-shihab-hossain/) & [Ahsan Jannat](https://www.linkedin.com/in/ahsan-jannat/)

---

## 📋 Table of Contents

- [What is TabDeck?](#what-is-tabdeck)
- [Features](#features)
- [Installation Guide](#installation-guide)
- [How to Use](#how-to-use)
  - [Workspaces](#workspaces)
  - [Quick Access](#quick-access)
  - [Bookmarks & Folders](#bookmarks--folders)
  - [Notes](#notes)
  - [Tasks](#tasks)
  - [Save from Any Page (Popup)](#save-from-any-page-popup)
  - [Analytics](#analytics)
  - [Settings & Appearance](#settings--appearance)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Open Source](#open-source)
- [Credits](#credits)

---

## What is TabDeck?

TabDeck turns your browser's new tab page into a personal command center. Instead of a blank page or a generic search box, you get:

- Your most-visited links one click away
- Notes and to-do lists always visible
- Your Chrome bookmarks organized by workspace
- A live clock, weather widget, and daily motivational quote
- History, downloads, and trash management — all without leaving the tab

Everything is saved locally in your browser. Nothing is sent to any server unless you choose to sign in with Google to sync across devices.

---

## Features

| Feature | Description |
|---|---|
| 🗂 **Workspaces** | Separate spaces for Work, Personal, School, etc. Each has its own bookmarks, notes, and tasks |
| ⭐ **Quick Access** | Pin your most-used sites as large icon tiles for one-click access |
| 📁 **Folders** | Organize bookmarks into named folders inside each workspace |
| 📝 **Notes** | Write and save notes directly in your new tab. Supports tags |
| ✅ **Tasks** | Simple to-do list with completion tracking |
| 🔖 **Popup Bookmarker** | Click the TabDeck icon in your toolbar to save any page to any workspace instantly |
| 📊 **Analytics** | See stats about your bookmarks, notes, tasks, browsing history, and downloads |
| 🌤 **Weather** | Live local weather shown automatically (or set your city manually) |
| 🕐 **Clock** | Live clock with 12h/24h format toggle |
| 💬 **Daily Quote** | A new motivational quote every day |
| ⏱ **Focus Timer** | Built-in Pomodoro-style countdown timer |
| 🎨 **Themes** | Dark and Light mode, plus a custom accent color picker |
| 🔍 **Search** | Press `/` to instantly search across all your bookmarks, notes, and history |
| 📥 **Downloads** | See your recent Chrome downloads without opening the downloads page |
| 🗑 **Trash** | Deleted bookmarks and notes go to trash and can be recovered |
| ↔ **Collapsible Sidebar** | Hide the sidebar for a distraction-free view |
| 📦 **Compact View** | Switch to a denser tile layout for your bookmarks |
| ☁️ **Google Sync** | Sign in with Google to back up and sync your data across devices |

---

## Installation Guide

TabDeck is installed as a **Chrome Extension**. Follow these steps — no technical knowledge needed.

### Step 1 — Download the files

1. Download the TabDeck folder to your computer
2. Unzip/extract it if it came as a `.zip` file
3. Remember where you saved it (e.g. `Downloads\tabDeck`)

### Step 2 — Open Chrome Extensions

1. Open **Google Chrome**
2. In the address bar at the top, type:
   ```
   chrome://extensions
   ```
   and press **Enter**
3. You'll see a page showing all your installed extensions

### Step 3 — Enable Developer Mode

1. Look for the **"Developer mode"** toggle in the **top-right corner** of the Extensions page
2. Click it to turn it **ON** (it will turn blue)

### Step 4 — Load TabDeck

1. Click the **"Load unpacked"** button that appears on the top-left
2. A file browser window will open
3. Navigate to the folder where you saved TabDeck (the folder that contains `manifest.json`)
4. Select that folder and click **"Select Folder"**

### Step 5 — Done!

TabDeck is now installed. Open a new tab and you'll see your new dashboard.

> **Tip:** To keep the TabDeck icon visible in your toolbar, click the puzzle piece icon (🧩) in Chrome's top-right corner, find TabDeck in the list, and click the pin icon 📌 next to it.

---

## How to Use

### Workspaces

Workspaces are like separate dashboards — one for Work, one for Personal, one for School, etc.

- The workspace tabs appear along the **left side** of the screen
- Click any workspace name to switch to it
- Click **"+ New"** at the bottom of the sidebar to create a new workspace
- Each workspace has its own Quick Access links, bookmarks, notes, and tasks
- Right-click a workspace tab to rename, change its emoji, or delete it

---

### Quick Access

Quick Access shows large icon tiles at the top of your dashboard for your most-visited sites.

- Click any tile to navigate to that site
- Click the **"+ Add"** tile to add a new link
- Hover over a tile and click the **⋯** button to edit or remove it
- Drag tiles to reorder them

---

### Bookmarks & Folders

Below Quick Access, you'll see your bookmarks organized into folders.

- Click a folder card to open it and see all links inside
- Click **"+ Add Folder"** to create a new folder
- Click the **⋯** button on a folder to rename, edit, import bookmarks from Chrome, or delete it
- You can also import your existing Chrome bookmarks into any workspace using the import option inside the folder menu
- The **Bookmarks** page (in the sidebar) shows all your Chrome browser bookmarks separately

---

### Notes

Click **Notes** in the sidebar or scroll to the Notes widget on the home page.

- Click **"+ New Note"** to write a note
- Add **#tags** in your note text to organize them (e.g. `#work`, `#ideas`)
- Click an existing note to edit it
- Notes are saved automatically when you close the editor
- Delete a note by clicking the trash icon — it goes to Trash and can be recovered

---

### Tasks

The Tasks widget shows your to-do list for the current workspace.

- Type in the input box at the top and press **Enter** to add a task
- Click the circle next to a task to mark it as done ✅
- Completed tasks are shown separately with a strikethrough
- Tasks are workspace-specific — your Work tasks don't appear in your Personal workspace

---

### Save from Any Page (Popup)

When you're browsing and want to save a page to TabDeck:

1. Click the **TabDeck icon** (⚡) in your Chrome toolbar
2. The popup shows the current page's title and URL (both editable)
3. Choose which **Workspace** to save to
4. Choose **Quick Access** (for important sites you use daily) or **Folder** (for organized storage)
5. If saving to a folder, select an existing folder or click **+** to create a new one
6. Click **Save Bookmark** — done!

---

### Analytics

Click the **bar chart icon** (📊) in the top-right toolbar to open Analytics.

You'll see:

- **Overview** — total bookmarks, notes, tasks, workspaces, and trash items
- **Tasks summary** — completion rate across all workspaces
- **Notes summary** — total notes and top tags
- **Workspace breakdown** — how many items each workspace contains
- **Top Folders** — your largest bookmark folders
- **Top Sites** — your most visited websites (from Chrome history)
- **Downloads** — recent download activity
- **Browsing Activity** — how many pages you've visited in the last 7 days

Click the **← back button** to return to your dashboard.

---

### Settings & Appearance

Click **Settings** at the bottom of the sidebar.

| Setting | What it does |
|---|---|
| **Your Name** | Changes the greeting on the dashboard |
| **Clock Format** | Switch between 12-hour and 24-hour |
| **Show Seconds** | Toggle seconds in the clock |
| **Accent Color** | Pick any color for buttons, highlights, and active states |
| **Card Glow** | Toggle the subtle glow effect on cards |
| **Widgets** | Show or hide Notes, Tasks, Quote, and Timer widgets |
| **Theme** | Toggle between Dark and Light mode (also in sidebar footer) |
| **Weather Location** | Set your city manually if auto-detection is wrong |
| **Google Sign-in** | Connect your Google account to sync data across devices |

Click **Save Settings** after making changes.

---

### Sidebar Toggle & Compact View

- Click the **panel icon** (⬜▶) at the far left of the top bar to collapse the sidebar and get more screen space. Click again to bring it back.
- Click the **grid icon** (⊞) to switch to **Compact View** — bookmarks become smaller tiles so you can see more at once. Click again to go back to normal view.

---

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `/` | Open the search palette |
| `Escape` | Close any open modal or panel |

---

## Frequently Asked Questions

**Is my data private?**  
Yes. All your data (bookmarks, notes, tasks) is stored locally in your browser using Chrome's built-in storage. Nothing is sent to any external server unless you sign in with Google to enable sync.

**Will my data be lost if I uninstall the extension?**  
Yes — uninstalling removes all locally stored data. Sign in with Google first to back up your data.

**Can I use TabDeck in other browsers (Firefox, Edge)?**  
Currently TabDeck is built for Google Chrome only. It may work in Chromium-based browsers like Microsoft Edge or Brave, but this is not officially tested.

**The weather isn't showing my correct location. How do I fix it?**  
Go to Settings → scroll to the Weather section → type your city name manually and save.

**I accidentally deleted something. Can I recover it?**  
Yes! Click **Trash** in the sidebar to see all recently deleted items. Click **Restore** to bring them back.

**How do I import my existing Chrome bookmarks?**  
Open any folder card → click the **⋯** menu → choose **Import from Chrome**. You can then pick which Chrome bookmark folder to import from.

---

## Open Source

TabDeck is free and open source software, released under the **MIT License**.

This means you are free to:
- ✅ Use it personally or commercially
- ✅ Copy and modify the code
- ✅ Share it with others
- ✅ Build your own version based on it

The only requirement is that you keep the original copyright notice when distributing.

See the [`LICENSE`](LICENSE) file for the full legal text.

**Want to contribute?** Feel free to open issues, suggest features, or submit improvements.

---

## Credits

Made with passion by:

- **[Sheikh Shihab Hossain](https://www.linkedin.com/in/sheikh-shihab-hossain/)** — Co-creator & Developer
- **[Ahsan Jannat](https://www.linkedin.com/in/ahsan-jannat/)** — Co-creator & Developer

---

*TabDeck v1.0.0 — Your new tab, your way.*
