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

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar on nav item click (mobile) — FIXED class name: .nav-item
    document.querySelectorAll('.nav-item').forEach(item => {
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
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'bi bi-sun-fill';
                if (themeToggle) themeToggle.title = 'Switch to Light Mode';
            } else {
                themeIcon.className = 'bi bi-moon-stars';
                if (themeToggle) themeToggle.title = 'Switch to Dark Mode';
            }
        }
        localStorage.setItem('advocatego-theme', theme);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('advocatego-theme') || 'light';
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme');
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    /* ── 3. TASK CHECKBOXES + PROGRESS BAR ──────────────────── */
    // FIXED class name: .task-cb (was .task-item__cb)
    const taskItems = document.querySelectorAll('.task-item');
    const progressFill = document.getElementById('progressFill');
    const progressCount = document.getElementById('progressCount');

    function updateProgress() {
        const total = taskItems.length;
        let done = 0;

        taskItems.forEach(item => {
            const cb = item.querySelector('.task-cb'); // FIXED
            if (!cb) return;
            if (cb.checked) {
                item.classList.add('is-done');
                done++;
            } else {
                item.classList.remove('is-done');
            }
        });

        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        if (progressFill) progressFill.style.width = pct + '%';
        if (progressCount) progressCount.textContent = `${done} / ${total} done`;
    }

    taskItems.forEach(item => {
        const cb = item.querySelector('.task-cb'); // FIXED
        if (cb) cb.addEventListener('change', updateProgress);
    });

    updateProgress(); // Initial state

    /* ── 4. INVOICE TABLE SEARCH + FILTER ───────────────────── */
    const invoiceSearch = document.getElementById('invoiceSearch');
    const invoiceFilter = document.getElementById('invoiceFilter');
    // FIXED id: #invoiceBody (was #invoiceTableBody)
    const invoiceRows = document.querySelectorAll('#invoiceBody tr');

    function filterInvoices() {
        const query = invoiceSearch ? invoiceSearch.value.toLowerCase().trim() : '';
        const statusVal = invoiceFilter ? invoiceFilter.value.toLowerCase() : '';
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

        // Show/hide "no results" row
        const tbody = document.getElementById('invoiceBody');
        if (!tbody) return;
        let noRow = tbody.querySelector('.no-results');
        if (visibleCount === 0) {
            if (!noRow) {
                noRow = document.createElement('tr');
                noRow.classList.add('no-results');
                noRow.innerHTML = `<td colspan="7" style="text-align:center;color:#888;padding:16px;">No invoices match your search.</td>`;
                tbody.appendChild(noRow);
            }
            noRow.style.display = '';
        } else {
            if (noRow) noRow.style.display = 'none';
        }
    }

    if (invoiceSearch) invoiceSearch.addEventListener('input', filterInvoices);
    if (invoiceFilter) invoiceFilter.addEventListener('change', filterInvoices);

    /* ── 5. CASE FILTER ──────────────────────────────────────── */
    const caseFilter = document.getElementById('caseFilter');
    const caseCards = document.querySelectorAll('.case-card');

    if (caseFilter) {
        caseFilter.addEventListener('change', () => {
            const val = caseFilter.value.toLowerCase();
            caseCards.forEach(card => {
                const type = (card.getAttribute('data-type') || '').toLowerCase();
                card.style.display = (val === '' || type === val) ? '' : 'none';
            });
        });
    }

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
    // FIXED class name: .wd (was .week-day)
    document.querySelectorAll('.wd').forEach(day => {
        day.addEventListener('click', () => {
            document.querySelectorAll('.wd').forEach(d => d.classList.remove('wd-active'));
            day.classList.add('wd-active');
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
    // FIXED class name: .nav-item (was .sidebar__nav-item)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

});