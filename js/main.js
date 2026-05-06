/* ============================================================
   AdvocateGo Dashboard — main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. SIDEBAR TOGGLE (Mobile) ── */
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() { sidebar.classList.add('is-open'); sidebarOverlay.classList.add('is-visible'); document.body.style.overflow = 'hidden'; }
    function closeSidebar() { sidebar.classList.remove('is-open'); sidebarOverlay.classList.remove('is-visible'); document.body.style.overflow = ''; }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar());
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
    window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeSidebar(); });

    /* ── 2. SIDEBAR NAV ACTIVE STATE ── */
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            if (window.innerWidth < 768) closeSidebar();
        });
    });

    /* ── 3. TASK PROGRESS (Tasks Due Today) ── */
    function initTaskProgress(listId, progressFillId, progressCountId) {
        const items = document.querySelectorAll(`#${listId} .task-item`);
        const fill = document.getElementById(progressFillId);
        const count = document.getElementById(progressCountId);
        if (!items.length) return;

        function update() {
            let done = 0;
            items.forEach(item => {
                const cb = item.querySelector('.task-cb');
                if (!cb) return;
                if (cb.checked) { item.classList.add('is-done'); done++; }
                else { item.classList.remove('is-done'); }
            });
            const pct = Math.round((done / items.length) * 100);
            if (fill) fill.style.width = pct + '%';
            if (count) count.textContent = `${done} of ${items.length} tasks completed`;
        }

        items.forEach(item => {
            const cb = item.querySelector('.task-cb');
            if (cb) cb.addEventListener('change', update);
        });
        update();
    }

    initTaskProgress('taskList1', 'pf1', 'pc1');

    /* ── 4. WEEK DAY SELECTOR ── */
    document.querySelectorAll('.wd').forEach(day => {
        day.addEventListener('click', () => {
            document.querySelectorAll('.wd').forEach(d => d.classList.remove('wd-active'));
            day.classList.add('wd-active');
        });
    });

    /* ── 5. BILLING TABLE FILTER ── */
    // (static, no filter needed — rows are visible by default)

    /* ── 6. TASKS & TO-DO PRIORITY FILTER ── */
    const taskPriorityFilter = document.getElementById('taskPriorityFilter');
    if (taskPriorityFilter) {
        taskPriorityFilter.addEventListener('change', () => {
            const val = taskPriorityFilter.value.toLowerCase();
            document.querySelectorAll('#todoBody tr').forEach(row => {
                const pri = (row.getAttribute('data-priority') || '').toLowerCase();
                row.style.display = (val === '' || pri === val) ? '' : 'none';
            });
        });
    }

    /* ── 7. CASE FILTER ── */
    const caseFilter = document.getElementById('caseFilter');
    if (caseFilter) {
        caseFilter.addEventListener('change', () => {
            const val = caseFilter.value.toLowerCase();
            document.querySelectorAll('.case-card').forEach(card => {
                const type = (card.getAttribute('data-type') || '').toLowerCase();
                card.style.display = (val === '' || type === val) ? '' : 'none';
            });
        });
    }

    /* ── 8. GLOBAL SEARCH (ESC to clear) ── */
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('keydown', e => {
            if (e.key === 'Escape') { globalSearch.value = ''; globalSearch.blur(); }
        });
    }

    /* ── 9. MARK AS DONE BUTTONS ── */
    document.querySelectorAll('.btn-mark-done').forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.card-box');
            if (!card) return;
            card.querySelectorAll('.task-cb').forEach(cb => { cb.checked = true; cb.dispatchEvent(new Event('change')); });
        });
    });

});