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

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 991) close();
        });
    }

    return { init, close };
})();


/* ── 3. TASK CHECKBOX + PROGRESS ───────────────────────────── */
/* FIX: .task-item__cb → .task-cb (HTML-এর actual class) */
const TaskManager = (() => {
    function updateProgress() {
        const checkboxes = document.querySelectorAll(".task-cb");
        const total = checkboxes.length;
        const done = Array.from(checkboxes).filter(cb => cb.checked).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        const textEl = document.getElementById("pc1");
        const fillEl = document.getElementById("pf1");

        if (textEl) textEl.textContent = `${done} of ${total} tasks completed`;
        if (fillEl) fillEl.style.width = `${pct}%`;
    }

    function syncDoneClass(checkbox) {
        const item = checkbox.closest(".task-item");
        if (!item) return;
        item.classList.toggle("is-done", checkbox.checked);
    }

    function init() {
        document.querySelectorAll(".task-cb").forEach(cb => {
            syncDoneClass(cb);
            cb.addEventListener("change", () => {
                syncDoneClass(cb);
                updateProgress();
            });
        });

        updateProgress();
    }

    return { init };
})();


/* ── 4. TABLE SEARCH / FILTER ──────────────────────────────── */
const TableFilter = (() => {
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

            let noResultRow = table.querySelector("tr.no-results");
            if (!visible && query) {
                if (!noResultRow) {
                    const colspan = table.querySelectorAll("thead th").length;
                    noResultRow = document.createElement("tr");
                    noResultRow.className = "no-results";
                    noResultRow.innerHTML =
                        `<td colspan="${colspan}" style="text-align:center;color:#6b7280;padding:12px;">No results for "<strong>${query}</strong>"</td>`;
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
        attach("billingSearch", "billingTable", [1, 3]);
        /* FIX: taskTable → todoTable (HTML-এর actual id) */
        attach("taskSearch", "todoTable", [0, 1, 3]);
    }

    return { init };
})();


/* ── 5. PRIORITY FILTER ────────────────────────────────────── */
const PriorityFilter = (() => {
    function init() {
        const select = document.getElementById("taskPriorityFilter");
        if (!select) return;

        select.addEventListener("change", () => {
            const val = select.value.toLowerCase();
            const rows = document.querySelectorAll("#todoTable tbody tr");

            rows.forEach(row => {
                if (row.classList.contains("no-results")) return;
                if (!val) { row.style.display = ""; return; }

                const priorityCell = row.querySelectorAll("td")[3];
                const match = priorityCell?.textContent.toLowerCase().includes(val);
                row.style.display = match ? "" : "none";
            });
        });
    }

    return { init };
})();


/* ── 6. WEEK DAY SELECTOR ──────────────────────────────────── */
/* FIX: global selectDay() function যোগ করা হয়েছে — HTML-এর onclick="selectDay(this)" কাজ করবে */
window.selectDay = function (el) {
    document.querySelectorAll(".wd").forEach(d => d.classList.remove("wd-active"));
    el.classList.add("wd-active");
};

const CalendarManager = (() => {
    function init() {
        document.querySelectorAll(".wd").forEach(day => {
            day.addEventListener("click", () => window.selectDay(day));
        });
    }

    return { init };
})();


/* ── 7. ACTIVE NAV HIGHLIGHT ───────────────────────────────── */
const NavManager = (() => {
    function init() {
        const items = document.querySelectorAll(".nav-item");
        items.forEach(item => {
            item.addEventListener("click", () => {
                items.forEach(n => n.classList.remove("active"));
                item.classList.add("active");
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