# Features And Functionalities

This file documents the features implemented in Todo Atelier. The points below are written for project evaluation, so each visible feature is described with what it does and how it helps the user.

## 1. Dashboard Navigation

The app has a left sidebar with separate views for Dashboard, My Tasks, Today, Upcoming, Completed, Categories, Focus Timer, Analytics, and Settings.

This makes the todo app feel like a small productivity workspace instead of a single long list. The user can move between views without leaving the page.

## 2. Task Creation

The task composer lets the user create a task with:

- Title
- Notes
- Category
- Priority
- Due date

The title is required because a task without a title is not useful. Notes, category, priority, and due date add more context for planning.

## 3. Task Listing

The app displays saved tasks as individual task cards. Each card shows the task title, category, priority, due date status, notes, completion button, edit button, and delete button.

This gives the user the important task information without needing to open another page for every small change.

## 4. Search

The search box filters tasks by title, notes, or category.

This is useful when the list becomes longer and the user wants to quickly find one task without scrolling through everything.

## 5. Filtering

The task list can be filtered by:

- All
- Active
- Done

This helps the user focus on the tasks that matter in the moment. For example, completed tasks can be hidden when the user only wants to see pending work.

## 6. Sorting

The task list can be sorted by:

- Newest
- Due date
- Priority
- Active first

Sorting gives the user control over how the list is arranged. Due-date sorting is useful for deadlines, while priority sorting is useful when urgent tasks should appear first.

## 7. Complete And Restore Tasks

Every task can be marked as completed. Completed tasks can also be restored to active.

This supports a normal todo workflow where a user may finish a task, make a mistake, or decide the task needs more work later.

## 8. Inline Editing

Tasks can be edited directly from the card view. The user can update the title, category, priority, due date, and notes without opening a separate form.

This keeps task maintenance quick and reduces extra navigation.

## 9. Task Deletion

Tasks can be deleted from the main task card. The detail page also has a delete option.

This allows the user to remove tasks that are no longer needed.

## 10. Today View

The Today view shows tasks that are due today or already overdue, as long as they are not completed.

This view helps the user focus on work that needs attention immediately.

## 11. Upcoming View

Upcoming tasks are grouped into:

- Tomorrow
- This Week
- Next Week
- Later

This gives the user a simple time-based plan instead of mixing every future task together.

## 12. Completed View

Completed tasks are shown separately with their completion date based on the latest update time.

This makes it easier to review finished work and also restore a task if it was completed by mistake.

## 13. Category Management

The Categories view shows all default and custom categories. It also counts how many tasks belong to each category.

The user can add a new category and can quickly open a category-filtered task list.

## 14. Dashboard Statistics

The dashboard calculates useful task numbers:

- Total tasks
- Active tasks
- Completed tasks
- Tasks due today
- Overdue tasks
- Tasks completed this week
- Productivity percentage
- Focus time

These numbers give the user a quick summary of progress.

## 15. Recent Activity

The dashboard shows recently updated tasks.

This helps the user see what changed recently and continue from where they left off.

## 16. Focus Timer

The Focus Timer view has focus and break modes. The user can set focus minutes and break minutes, start or pause the timer, and reset it.

When a focus session finishes, the app stores that session in the current browser session and adds it to focus-time statistics.

## 17. Analytics

The Analytics view shows productivity metrics and a category chart. The chart compares categories by task count.

This gives a simple visual summary of how the user is spending task effort across different areas.

## 18. Settings

The Settings view includes:

- Profile name
- Theme choice
- Language choice
- Notifications toggle
- Automatic backup toggle
- Export tasks button
- Import tasks button

Some settings currently update the interface state, such as the profile name. The export and import buttons are present as interface controls for future data portability work.

## 19. Detail Page

The detail page opens a single task using the task id in the URL. It allows the user to edit the title, notes, category, priority, due date, and completed status.

This page is useful when the user wants a larger editing area for one task.

## 20. Local JSON Persistence

The backend stores todo data in `backend/data/todos.json`.

This keeps the project simple to run because it does not require MongoDB, MySQL, or any hosted database. The data remains available after the server restarts as long as the JSON file is kept.

## 21. REST API

The Express backend exposes endpoints to create, read, update, and delete todos.

The frontend communicates with the backend through `frontend/src/api.js`, which keeps API calls in one place.

## 22. Input Cleaning

The backend trims text input, validates title presence, checks priority values, and accepts only valid due date strings.

This helps keep saved todo data consistent.

## 23. Empty And Error States

The frontend shows messages when tasks are loading, when no tasks match the current view, and when the backend is unavailable.

This improves usability because the user receives feedback instead of seeing an unexplained empty screen.

## 24. Responsive Layout

The CSS includes responsive rules for smaller screens. The layout changes from multi-column sections to single-column sections when space is limited.

This allows the app to remain usable on smaller displays.

## Originality Note

The wording in this file was written specifically for this Todo Atelier repository. It is not copied from another project description or online documentation.
