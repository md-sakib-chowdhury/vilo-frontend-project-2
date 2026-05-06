/* ============================================================
   AdvocateGo Dashboard — Vanilla JavaScript
   Author  : Md. Sakib Chowdhury
   Features: Sidebar Toggle, Dark/Light Mode, Table Search/Filter,
             Task Progress, Case Filter, Revenue Chart
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. SIDEBAR TOGGLE (Mobile) ─────────────────────────── */
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        sidebar.classList.add('is-open');
        sidebarOverlay.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('is-open');
        sidebarOverlay.classList.remove('is-visible');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
    });

    sidebarOverlay.addEventListener('click', closeSidebar);

    // Close sidebar on nav item click (mobile)
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 768) closeSidebar();
        });
    });

    // Close sidebar on resize if desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) closeSidebar();
    });

    /* ── 2. DARK / LIGHT MODE TOGGLE (with localStorage) ────── */
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlEl = document.documentElement;

    function applyTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            themeIcon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
            themeToggle.title = 'Switch to Light Mode';
        } else {
            themeIcon.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
            themeToggle.title = 'Switch to Dark Mode';
        }
        localStorage.setItem('advocatego-theme', theme);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('advocatego-theme') || 'light';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = htmlEl.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    /* ── 3. TASK CHECKBOXES + PROGRESS BAR ──────────────────── */
    const taskItems = document.querySelectorAll('.task-item');
    const progressFill = document.getElementById('progressFill');
    const progressCount = document.getElementById('progressCount');

    function updateProgress() {
        const total = taskItems.length;
        let done = 0;

        taskItems.forEach(item => {
            const cb = item.querySelector('.task-item__cb');
            if (cb.checked) {
                item.classList.add('is-done');
                done++;
            } else {
                item.classList.remove('is-done');
            }
        });

        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        progressFill.style.width = pct + '%';
        progressCount.textContent = `${done} / ${total} done`;
    }

    taskItems.forEach(item => {
        const cb = item.querySelector('.task-item__cb');
        cb.addEventListener('change', updateProgress);
    });

    // Initial state
    updateProgress();

    /* ── 4. INVOICE TABLE SEARCH + FILTER ───────────────────── */
    const invoiceSearch = document.getElementById('invoiceSearch');
    const invoiceFilter = document.getElementById('invoiceFilter');
    const invoiceRows = document.querySelectorAll('#invoiceTableBody tr');

    function filterInvoices() {
        const query = invoiceSearch.value.toLowerCase().trim();
        const statusVal = invoiceFilter.value.toLowerCase();
        let visibleCount = 0;

        invoiceRows.forEach(row => {
            if (row.classList.contains('no-results')) return;

            const text = row.textContent.toLowerCase();
            const badge = row.querySelector('.badge');
            const status = badge ? badge.textContent.toLowerCase() : '';

            const matchText = query === '' || text.includes(query);
            const matchStatus = statusVal === '' || status.includes(statusVal);

            if (matchText && matchStatus) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Show "no results" row
        const noRow = document.querySelector('#invoiceTableBody .no-results');
        if (noRow) {
            noRow.style.display = visibleCount === 0 ? '' : 'none';
        } else if (visibleCount === 0) {
            const tr = document.createElement('tr');
            tr.classList.add('no-results');
            tr.innerHTML = `<td colspan="7">No invoices match your search.</td>`;
            document.getElementById('invoiceTableBody').appendChild(tr);
        }
    }

    invoiceSearch.addEventListener('input', filterInvoices);
    invoiceFilter.addEventListener('change', filterInvoices);

    /* ── 5. CASE FILTER ──────────────────────────────────────── */
    const caseFilter = document.getElementById('caseFilter');
    const caseCards = document.querySelectorAll('.case-card');

    caseFilter.addEventListener('change', () => {
        const val = caseFilter.value.toLowerCase();
        caseCards.forEach(card => {
            const type = card.getAttribute('data-type') || '';
            card.style.display = (val === '' || type === val) ? '' : 'none';
        });
    });

    /* ── 6. REVENUE BAR CHART (Vanilla JS) ───────────────────── */
    const revData = [
        { month: 'Jan', value: 42 },
        { month: 'Feb', value: 58 },
        { month: 'Mar', value: 51 },
        { month: 'Apr', value: 73 },
        { month: 'May', value: 84 },
        { month: 'Jun', value: 69 },
        { month: 'Jul', value: 91 },
        { month: 'Aug', value: 78 },
        { month: 'Sep', value: 88 },
        { month: 'Oct', value: 65 },
        { month: 'Nov', value: 72 },
        { month: 'Dec', value: 95 },
    ];

    const maxVal = Math.max(...revData.map(d => d.value));
    const revBars = document.getElementById('revBars');

    if (revBars) {
        revData.forEach(d => {
            const heightPct = (d.value / maxVal) * 100;
            const wrap = document.createElement('div');
            wrap.className = 'rev-bar-wrap';
            wrap.innerHTML = `
        <div class="rev-bar" style="height:${heightPct}%" title="$${d.value}k"></div>
        <span class="rev-label">${d.month}</span>
      `;
            revBars.appendChild(wrap);
        });
    }

    /* ── 7. WEEK DAY SELECTOR ────────────────────────────────── */
    document.querySelectorAll('.week-day').forEach(day => {
        day.addEventListener('click', () => {
            document.querySelectorAll('.week-day').forEach(d => d.classList.remove('is-active'));
            day.classList.add('is-active');
        });
    });

    /* ── 8. GLOBAL SEARCH (visual feedback only) ─────────────── */
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                globalSearch.value = '';
                globalSearch.blur();
            }
        });
    }

    /* ── 9. SIDEBAR NAV ACTIVE STATE ─────────────────────────── */
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.sidebar__nav-item').forEach(i => i.classList.remove('is-active'));
            this.classList.add('is-active');
        });
    });

});