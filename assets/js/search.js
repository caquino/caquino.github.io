// Pagefind search modal, triggered by the header button or `/` / Ctrl+K.
// Pagefind's own UI handles the search input, results, and keyboard nav
// once mounted into our dialog.
(function () {
    var LOADED = false;
    var dialog;
    var trigger = document.getElementById('siteSearchTrigger');
    if (!trigger) return;

    function ensureDialog() {
        if (dialog) return dialog;
        dialog = document.createElement('div');
        dialog.className = 'site-search-overlay';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-label', 'Search');
        dialog.innerHTML = '<div class="site-search-panel"><div id="pagefind"></div></div>';
        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) close();
        });
        document.body.appendChild(dialog);
        return dialog;
    }

    function loadPagefind() {
        if (LOADED) return Promise.resolve();

        return new Promise(function (resolve, reject) {
            var cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/pagefind/pagefind-ui.css';
            document.head.appendChild(cssLink);

            var s = document.createElement('script');
            s.src = '/pagefind/pagefind-ui.js';
            s.onload = function () {
                if (typeof window.PagefindUI !== 'function') {
                    reject(new Error('PagefindUI global missing after script load'));
                    return;
                }
                new window.PagefindUI({
                    element: '#pagefind',
                    showImages: false,
                    showSubResults: true,
                    resetStyles: false,
                    placeholder: 'Search posts…',
                });
                LOADED = true;
                resolve();
            };
            s.onerror = reject;
            document.head.appendChild(s);
        }).catch(function (e) {
            var host = document.getElementById('pagefind');
            if (host) host.textContent = 'Search index not available in dev.';
            console.warn('pagefind load failed', e);
        });
    }

    function open() {
        ensureDialog();
        loadPagefind().then(function () {
            dialog.classList.add('open');
            var input = dialog.querySelector('input');
            if (input) input.focus();
        });
    }

    function close() {
        if (dialog) dialog.classList.remove('open');
        trigger.focus();
    }

    trigger.addEventListener('click', open);

    document.addEventListener('keydown', function (e) {
        // Open: /  or  Ctrl+K / Cmd+K
        var inInput = /^(input|textarea|select)$/i.test((e.target || {}).tagName);
        var k = (e.key || '').toLowerCase();
        if (!inInput && k === '/') { e.preventDefault(); open(); return; }
        if (k === 'k' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); open(); return; }
        if (k === 'escape' && dialog && dialog.classList.contains('open')) { close(); }
    });
})();
