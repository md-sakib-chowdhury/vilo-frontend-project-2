/**
 * AdvocateGo Dashboard — Main JavaScript
 * Author  : Md. Sakib Chowdhury
 * Stack   : Vanilla JavaScript (No jQuery / No Framework)
 * Version : 1.0.0
 *
 * Sections:
 *  1. Dark / Light Mode Toggle  (localStorage persisted)
 *  2. Sidebar Toggle            (mobile responsive)
 *  3. Task Checkbox Handler     (done state + progress bar)
 *  4. Table Search / Filter     (billing & task tables)
 *  5. Priority Filter           (task table dropdown)
 *  6. Week Day Selector         (calendar)
 *  7. Active Nav Highlight
 *  8. Init
 */

"use strict";

/* ── 1. DARK / LIGHT MODE ──────────────────────────────────── */
const ThemeManager = (() => {
    const STORAGE_KEY = "advocatego_theme";
    const DARK = "dark";
    const LIGHT = "light";

    const html = document.documentElement;
    const toggleBtn = document.getElementById("themeToggle");
    const toggleIcon = document.getElementById("themeIcon");

    function apply(theme) {
        html.setAttribute("data-theme", theme);
        localStorage.setItem(STORAGE_KEY, theme);

        if (toggleIcon) {
            toggleIcon.className = theme === DARK
                ? "bi bi-sun-fill"
                : "bi bi-moon-stars-fill";
        }
        if (toggleBtn) {
            toggleBtn.setAttribute("aria-label",
                theme === DARK ? "Switch to light mode" : "Switch to dark mode"
            );
        }

        /* SVG donut text colour */
        const donutText = document.getElementById("donutPct");
        if (donutText) {
            donutText.setAttribute("fill", theme === DARK ? "#e2e8f0" : "#1a1a2e");
        }
    }

    function toggle() {
        const current = html.getAttribute("data-theme") || LIGHT;
        apply(current === DARK ? LIGHT : DARK);
    }

    function init() {
        const saved = localStorage.getItem(STORAGE_KEY) || LIGHT;
        apply(saved);
        if (toggleBtn) toggleBtn.addEventListener("click", toggle);
    }

    return { init };
})();


/* ── 2. SIDEBAR TOGGLE ─────────────────────────────────────── */
const SidebarManager = (() => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const hamburger = document.getElementById("hamburgerBtn");

    function open() {
        sidebar?.classList.add("is-open");
        overlay?.classList.add("is-visible");
        document.body.style.overflow = "hidden";
    }

    function close() {
        sidebar?.classList.remove("is-open");
        overlay?.classList.remove("is-visible");
        document.body.style.overflow = "";
    }

    function toggle() {
        sidebar?.classList.contains("is-open") ? close() : open();
    }

    function init() {
        hamburger?.addEventListener("click", toggle);
        overlay?.addEventListener("click", close);

        /* Close on ESC */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        });

        /* Close on resize to desktop */
        window.addEventListener("resize", () => {
            if (window.innerWidth > 991) close();
        });
    }

    return { init, close };
})();


/* ── 3. TASK CHECKBOX + PROGRESS ───────────────────────────── */
const TaskManager = (() => {
    const TASKS_WRAPPER = "tasksDueList";
    const PROGRESS_TEXT = "progressText";
    const PROGRESS_FILL = "progressFill";

    function updateProgress() {
        const wrapper = document.getElementById(TASKS_WRAPPER);
        if (!wrapper) return;

        const checkboxes = wrapper.querySelectorAll(".task-item__cb");
        const total = checkboxes.length;
        const done = Array.from(checkboxes).filter(cb => cb.checked).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        const textEl = document.getElementById(PROGRESS_TEXT);
        const fillEl = document.getElementById(PROGRESS_FILL);

        if (textEl) textEl.textContent = `${done} of ${total} tasks completed`;
        if (fillEl) fillEl.style.width = `${pct}%`;
    }

    function syncDoneClass(checkbox) {
        const item = checkbox.closest(".task-item");
        if (!item) return;
        item.classList.toggle("is-done", checkbox.checked);
    }

    function init() {
        /* Handle all task checkboxes (both panels) */
        document.querySelectorAll(".task-item__cb").forEach(cb => {
            /* Sync initial state */
            syncDoneClass(cb);

            cb.addEventListener("change", () => {
                syncDoneClass(cb);
                updateProgress();
            });
        });

        /* Initial progress render */
        updateProgress();
    }

    return { init };
})();


/* ── 4. TABLE SEARCH / FILTER ──────────────────────────────── */
const TableFilter = (() => {
    /**
     * Attach live search to a table.
     * @param {string} inputId   — id of <input> search field
     * @param {string} tableId   — id of <table>
     * @param {number[]} cols    — column indexes to search (0-based), omit = all
     */
    function attach(inputId, tableId, cols = []) {
        const input = document.getElementById(inputId);
        const table = document.getElementById(tableId);
        if (!input || !table) return;

        input.addEventListener("input", () => {
            const query = input.value.trim().toLowerCase();
            const rows = table.querySelectorAll("tbody tr");
            let visible = 0;

            rows.forEach(row => {
                if (row.classList.contains("no-results")) return;

                const cells = row.querySelectorAll("td");
                const text = cols.length
                    ? cols.map(i => cells[i]?.textContent || "").join(" ").toLowerCase()
                    : row.textContent.toLowerCase();

                const match = text.includes(query);
                row.style.display = match ? "" : "none";
                if (match) visible++;
            });

            /* Show / hide no-results row */
            let noResultRow = table.querySelector("tr.no-results");
            if (!visible && query) {
                if (!noResultRow) {
                    const colspan = table.querySelectorAll("thead th").length;
                    noResultRow = document.createElement("tr");
                    noResultRow.className = "no-results";
                    noResultRow.innerHTML =
                        `<td colspan="${colspan}">No results for "<strong>${query}</strong>"</td>`;
                    table.querySelector("tbody").appendChild(noResultRow);
                } else {
                    noResultRow.style.display = "";
                    noResultRow.querySelector("td").innerHTML =
                        `No results for "<strong>${query}</strong>"`;
                }
            } else if (noResultRow) {
                noResultRow.style.display = "none";
            }
        });
    }

    function init() {
        attach("billingSearch", "billingTable", [1, 3]);   /* NAME + STATUS */
        attach("taskSearch", "taskTable", [1, 2, 4]); /* TITLE + CLIENT + PRIORITY */
    }

    return { init };
})();


/* ── 5. PRIORITY FILTER ────────────────────────────────────── */
const PriorityFilter = (() => {
    function init() {
        const select = document.getElementById("priorityFilter");
        if (!select) return;

        select.addEventListener("change", () => {
            const val = select.value.toLowerCase();
            const rows = document.querySelectorAll("#taskTable tbody tr");

            rows.forEach(row => {
                if (row.classList.contains("no-results")) return;
                if (!val) { row.style.display = ""; return; }

                const priorityCell = row.querySelectorAll("td")[4];
                const match = priorityCell?.textContent.toLowerCase().includes(val);
                row.style.display = match ? "" : "none";
            });
        });
    }

    return { init };
})();


/* ── 6. WEEK DAY SELECTOR ──────────────────────────────────── */
const CalendarManager = (() => {
    function init() {
        const days = document.querySelectorAll(".week-day");
        days.forEach(day => {
            day.addEventListener("click", () => {
                days.forEach(d => d.classList.remove("is-active"));
                day.classList.add("is-active");
            });
        });
    }

    return { init };
})();


/* ── 7. ACTIVE NAV HIGHLIGHT ───────────────────────────────── */
const NavManager = (() => {
    function init() {
        const items = document.querySelectorAll(".sidebar__nav-item");
        items.forEach(item => {
            item.addEventListener("click", () => {
                items.forEach(n => n.classList.remove("is-active"));
                item.classList.add("is-active");
                SidebarManager.close();
            });
        });
    }

    return { init };
})();


/* ── 8. INIT ───────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    ThemeManager.init();
    SidebarManager.init();
    TaskManager.init();
    TableFilter.init();
    PriorityFilter.init();
    CalendarManager.init();
    NavManager.init();
});