// Vanilla site scripts.
// Hover-reveal # heading anchors, share button (Web Share API + copy fallback).
// Burger menu is pure CSS (checkbox hack on .site-nav-toggle) — no JS needed.
// OG image is set at build time via page.cover + jekyll-seo-tag, not at runtime.
(function () {

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initHeadingMarkers() {
        var headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6');
        headings.forEach(function (h) {
            h.addEventListener('mouseenter', function () {
                if (!h.id || h.querySelector('.heading-marker')) return;
                var a = document.createElement('a');
                a.className = 'heading-marker';
                a.href = '#' + h.id;
                a.textContent = '#';
                h.appendChild(a);
            });
            h.addEventListener('mouseleave', function () {
                var a = h.querySelector('.heading-marker');
                if (a) a.remove();
            });
        });
    }

    function initShareButtons() {
        var buttons = document.querySelectorAll('.share-link');
        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var url = btn.getAttribute('data-url') || window.location.href;
                var title = btn.getAttribute('data-title') || document.title;

                if (navigator.share) {
                    navigator.share({ title: title, url: url }).catch(function () {});
                    return;
                }

                var copied = function () {
                    btn.classList.add('copied');
                    var label = btn.querySelector('.share-label');
                    var original = label ? label.textContent : null;
                    if (label) label.textContent = 'Link copied';
                    setTimeout(function () {
                        btn.classList.remove('copied');
                        if (label && original !== null) label.textContent = original;
                    }, 1500);
                };

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(copied).catch(function () {});
                } else {
                    var ta = document.createElement('textarea');
                    ta.value = url;
                    ta.style.position = 'absolute';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); copied(); } catch (e) { /* noop */ }
                    document.body.removeChild(ta);
                }
            });
        });
    }

    onReady(function () {
        initHeadingMarkers();
        initShareButtons();
    });
})();
