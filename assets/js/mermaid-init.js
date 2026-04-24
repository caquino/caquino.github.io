// Conditionally load Mermaid.js only when a post contains mermaid blocks.
// Theme follows the OS / user preference via prefers-color-scheme, matching
// the rest of the site's auto dark-mode.
(function () {
    var blocks = document.querySelectorAll('pre > code.language-mermaid, code.language-mermaid');
    if (blocks.length === 0) return;

    // Convert <pre><code class="language-mermaid">...</code></pre> into the
    // <div class="mermaid"> structure Mermaid expects, and undo the terminal-window
    // code-block styling by removing the outer .highlighter-rouge wrapper.
    blocks.forEach(function (code) {
        var pre = code.parentElement;
        var outer = pre && pre.parentElement;                 // .highlight
        var wrapper = outer && outer.parentElement;           // .highlighter-rouge
        var host = (wrapper && wrapper.classList.contains('highlighter-rouge')) ? wrapper : pre;
        var div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = code.textContent;
        host.replaceWith(div);
    });

    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
    s.onload = function () {
        window.mermaid.initialize({
            startOnLoad: true,
            theme: prefersDark ? 'dark' : 'default',
            securityLevel: 'strict',
            flowchart: { curve: 'basis' },
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        });
    };
    document.head.appendChild(s);
})();
