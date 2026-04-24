// Tiny back-to-top button. Appears after 300px of scroll, smooth-scrolls home.
(function () {
    var THRESHOLD = 300;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'backtotop';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 10 8 6 12 10"></polyline></svg>';
    btn.style.cssText = [
        'position:fixed', 'bottom:32px', 'right:32px', 'z-index:10000',
        'width:40px', 'height:40px', 'border-radius:50%',
        'background:var(--text)', 'color:var(--bg)',
        'border:none', 'cursor:pointer',
        'display:flex', 'align-items:center', 'justify-content:center',
        'opacity:0', 'pointer-events:none',
        'transition:opacity 0.2s ease',
        'box-shadow:0 4px 12px rgba(0,0,0,0.15)'
    ].join(';');

    function update() {
        var visible = (window.scrollY || document.documentElement.scrollTop) > THRESHOLD;
        btn.style.opacity = visible ? '0.65' : '0';
        btn.style.pointerEvents = visible ? 'auto' : 'none';
    }

    btn.addEventListener('mouseenter', function () { btn.style.opacity = '1'; });
    btn.addEventListener('mouseleave', update);
    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function init() {
        document.body.appendChild(btn);
        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
