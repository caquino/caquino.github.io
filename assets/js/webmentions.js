// Fetch and render webmentions for the current post from webmention.io's
// public JF2 API. No auth required to read.
// Reply / mention / repost / like aggregated into a single list, with
// like-type entries rolled up into a facepile at the top.
(function () {
    var container = document.querySelector('.webmentions');
    if (!container) return;
    var list = container.querySelector('.webmentions-list');
    var target = container.getAttribute('data-post-url');
    if (!target) return;

    var api = 'https://webmention.io/api/mentions.jf2?per-page=40&target=' +
              encodeURIComponent(target);

    fetch(api)
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(render)
        .catch(function () {
            list.innerHTML = '<li class="webmentions-empty">No mentions yet.</li>';
        });

    function render(data) {
        var items = (data && data.children) || [];
        if (!items.length) {
            list.innerHTML = '<li class="webmentions-empty">No mentions yet.</li>';
            return;
        }

        var likes = items.filter(function (i) { return i['wm-property'] === 'like-of'; });
        var reposts = items.filter(function (i) { return i['wm-property'] === 'repost-of'; });
        var replies = items.filter(function (i) {
            return i['wm-property'] === 'in-reply-to' ||
                   i['wm-property'] === 'mention-of';
        });

        var html = '';
        if (likes.length || reposts.length) {
            html += '<li class="webmentions-facepile">';
            likes.concat(reposts).forEach(function (i) {
                var a = (i.author || {});
                var photo = a.photo ? '<img src="' + escape(a.photo) + '" alt="" loading="lazy" width="28" height="28">' : '';
                var name = escapeText(a.name || 'Anon');
                var url  = a.url ? ' href="' + escape(a.url) + '"' : '';
                var label = i['wm-property'] === 'repost-of' ? 'reposted' : 'liked';
                html += '<a class="webmentions-face" title="' + name + ' ' + label + '"' + url + ' rel="nofollow">' + photo + '</a>';
            });
            html += '</li>';
        }

        replies.forEach(function (i) {
            var a = (i.author || {});
            var photo = a.photo ? '<img class="webmentions-avatar" src="' + escape(a.photo) + '" alt="" loading="lazy" width="36" height="36">' : '';
            var name  = escapeText(a.name || 'Anon');
            var text  = escapeText(((i.content && (i.content.text || i.content.value)) || '')).slice(0, 600);
            var source = i['wm-source'] || i.url || '#';
            var when  = i.published ? new Date(i.published).toLocaleDateString() : '';
            html += '<li class="webmentions-reply">' + photo +
                    '<div class="webmentions-body">' +
                      '<a class="webmentions-author" href="' + escape(a.url || source) + '" rel="nofollow">' + name + '</a>' +
                      (when ? ' <span class="webmentions-date">· ' + when + '</span>' : '') +
                      '<p>' + text + '</p>' +
                      '<a class="webmentions-source" href="' + escape(source) + '" rel="nofollow">source →</a>' +
                    '</div></li>';
        });

        list.innerHTML = html || '<li class="webmentions-empty">No mentions yet.</li>';
    }

    function escape(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function escapeText(s) { return escape(s); }
})();
