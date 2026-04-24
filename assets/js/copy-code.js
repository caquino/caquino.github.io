// Adds a copy-to-clipboard button to every terminal-style code block.
// Matches both fenced blocks (.highlighter-rouge) and {% highlight %} tags (figure.highlight).
(function () {
    var ICON_COPY = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="1.5"></rect><path d="M4 11V3a1 1 0 0 1 1-1h8"></path></svg>';
    var ICON_CHECK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 8 7 12 13 5"></polyline></svg>';

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        // Fallback for older browsers / non-HTTPS contexts.
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy') ? resolve() : reject();
            } catch (e) { reject(e); }
            document.body.removeChild(ta);
        });
    }

    function attachTo(block) {
        var code = block.querySelector('pre > code, pre');
        if (!code) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-code-btn';
        btn.setAttribute('aria-label', 'Copy code to clipboard');
        btn.innerHTML = ICON_COPY;
        btn.addEventListener('click', function () {
            copyText(code.innerText.replace(/\n$/, ''))
                .then(function () {
                    btn.classList.add('copied');
                    btn.innerHTML = ICON_CHECK;
                    setTimeout(function () {
                        btn.classList.remove('copied');
                        btn.innerHTML = ICON_COPY;
                    }, 1400);
                })
                .catch(function () {
                    btn.classList.add('failed');
                    setTimeout(function () { btn.classList.remove('failed'); }, 1400);
                });
        });
        block.appendChild(btn);
    }

    function init() {
        var blocks = document.querySelectorAll('div.highlighter-rouge, figure.highlight');
        for (var i = 0; i < blocks.length; i++) attachTo(blocks[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
