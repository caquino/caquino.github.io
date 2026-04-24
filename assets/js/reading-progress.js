// Reading progress bar — only on post pages (layout: post).
// Fills left-to-right based on scroll position through the post-content region,
// not the whole document, so nav and footer don't count.
(function () {
    var article = document.querySelector('article.post.single');
    if (!article) return;

    var bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<span class="reading-progress-fill"></span>';
    document.body.appendChild(bar);

    var fill = bar.querySelector('.reading-progress-fill');

    function update() {
        var rect = article.getBoundingClientRect();
        var articleHeight = rect.height - window.innerHeight;
        if (articleHeight <= 0) { fill.style.width = '100%'; return; }
        var scrolled = -rect.top;
        var pct = Math.max(0, Math.min(100, (scrolled / articleHeight) * 100));
        fill.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
})();
